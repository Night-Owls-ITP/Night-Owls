import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Compra } from '../compras/compra.entity';
import { DetalleCompra } from './detalle-compra.entity';
import { DetallesCompraService } from './detalles-compra.service';
import { Repuesto } from '../repuestos/repuesto.entity';

jest.mock('@nestjs/typeorm', () => ({
  InjectDataSource: () => () => undefined,
  InjectRepository: () => () => undefined,
}));

function crearHarness() {
  const state: {
    compras: Compra[];
    repuestos: Repuesto[];
    detalles: DetalleCompra[];
    nextDetalleId: number;
  } = { compras: [], repuestos: [], detalles: [], nextDetalleId: 1 };
  const lockOrders: string[] = [];

  const getRows = (target: Function) => {
    if (target === Compra) return state.compras;
    if (target === Repuesto) return state.repuestos;
    return state.detalles;
  };

  const manager = {
    getRepository(target: Function) {
      const rows = () => getRows(target);
      return {
        create: (values: object) => ({ ...values }),
        findOne: jest.fn(
          async (options: { where: { id: number }; lock?: unknown }) => {
            if (options.lock)
              lockOrders.push(`${target.name}:${options.where.id}`);
            return (
              rows().find((record) => record.id === options.where.id) ?? null
            );
          },
        ),
        find: jest.fn(
          async (options?: { where?: { compra?: { id: number } } }) => {
            if (target !== DetalleCompra) return rows();
            const compraId = options?.where?.compra?.id;
            return compraId === undefined
              ? rows()
              : rows().filter((detail) => detail.compraId === compraId);
          },
        ),
        count: jest.fn(
          async (options: { where: { compra?: { id: number } } }) =>
            rows().filter(
              (detail) => detail.compraId === options.where.compra?.id,
            ).length,
        ),
        save: jest.fn(async (record: object | object[]) => {
          const batch = Array.isArray(record) ? record : [record];
          for (const item of batch) {
            const entity = item as Record<string, unknown>;
            if (target === DetalleCompra) {
              entity.compraId = (entity.compra as Compra).id;
              entity.repuestoId = (entity.repuesto as Repuesto).id;
              if (!entity.id) entity.id = state.nextDetalleId++;
            }
            const existing = rows().findIndex((row) => row.id === entity.id);
            if (existing === -1) rows().push(entity as never);
            else Object.assign(rows()[existing], entity);
          }
          return Array.isArray(record) ? batch : batch[0];
        }),
        remove: jest.fn(async (record: { id: number }) => {
          const index = rows().findIndex((row) => row.id === record.id);
          if (index !== -1) rows().splice(index, 1);
          return record;
        }),
      };
    },
  };

  const dataSource = {
    transaction: jest.fn(
      async (callback: (tx: EntityManager) => Promise<unknown>) => {
        const snapshot = structuredClone(state);
        try {
          return await callback(manager as unknown as EntityManager);
        } catch (error) {
          state.compras = snapshot.compras;
          state.repuestos = snapshot.repuestos;
          state.detalles = snapshot.detalles;
          state.nextDetalleId = snapshot.nextDetalleId;
          throw error;
        }
      },
    ),
  } as unknown as DataSource;
  const service = new DetallesCompraService(
    {} as Repository<DetalleCompra>,
    dataSource,
  );
  return { state, service, lockOrders };
}

function agregarCompra(
  harness: ReturnType<typeof crearHarness>,
  id: number,
  total = '0.00',
) {
  harness.state.compras.push({ id, total } as Compra);
}

function agregarRepuesto(
  harness: ReturnType<typeof crearHarness>,
  id: number,
  stock = 0,
  activo = true,
) {
  harness.state.repuestos.push({ id, stock, activo } as Repuesto);
}

function agregarDetalle(
  harness: ReturnType<typeof crearHarness>,
  compraId: number,
  repuestoId: number,
  cantidad: number,
  costoUnitario: string,
) {
  const compra = harness.state.compras.find((row) => row.id === compraId)!;
  const repuesto = harness.state.repuestos.find(
    (row) => row.id === repuestoId,
  )!;
  const detalle = {
    id: harness.state.nextDetalleId++,
    compra,
    compraId,
    repuesto,
    repuestoId,
    cantidad,
    costoUnitario,
  } as DetalleCompra;
  harness.state.detalles.push(detalle);
  return detalle;
}

describe('DetallesCompraService', () => {
  it('rechaza relaciones inexistentes o repuestos inactivos sin escribir', async () => {
    const harness = crearHarness();
    agregarCompra(harness, 1);
    agregarRepuesto(harness, 1, 0, false);

    await expect(
      harness.service.crear({
        compraId: 9,
        repuestoId: 1,
        cantidad: 1,
        costoUnitario: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      harness.service.crear({
        compraId: 1,
        repuestoId: 9,
        cantidad: 1,
        costoUnitario: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      harness.service.crear({
        compraId: 1,
        repuestoId: 1,
        cantidad: 1,
        costoUnitario: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(harness.state.detalles).toHaveLength(0);
    expect(harness.state.repuestos[0].stock).toBe(0);
  });

  it('incrementa stock, guarda costo histórico y calcula subtotal y total a centavos', async () => {
    const harness = crearHarness();
    agregarCompra(harness, 1);
    agregarRepuesto(harness, 1);

    const created = await harness.service.crear({
      compraId: 1,
      repuestoId: 1,
      cantidad: 3,
      costoUnitario: 19.95,
    });
    harness.state.repuestos[0].precioVenta = '999.99';

    expect(harness.state.repuestos[0].stock).toBe(3);
    expect(created.costoUnitario).toBe('19.95');
    expect(created.subtotal).toBe('59.85');
    expect(harness.state.compras[0].total).toBe('59.85');
  });

  it('ajusta solo la diferencia al cambiar cantidad y cambia inventario al cambiar repuesto', async () => {
    const harness = crearHarness();
    agregarCompra(harness, 1, '4.20');
    agregarRepuesto(harness, 1, 5);
    agregarRepuesto(harness, 2, 0);
    agregarDetalle(harness, 1, 1, 2, '2.10');

    await harness.service.actualizar(1, { cantidad: 3 });
    expect(harness.state.repuestos.map((row) => row.stock)).toEqual([6, 0]);
    expect(harness.state.compras[0].total).toBe('6.30');

    await harness.service.actualizar(1, { repuestoId: 2 });
    expect(harness.state.repuestos.map((row) => row.stock)).toEqual([3, 3]);
    expect(harness.state.compras[0].total).toBe('6.30');
  });

  it('mover de compra recalcula ambos totales y cambiar costo no altera stock', async () => {
    const harness = crearHarness();
    agregarCompra(harness, 1, '6.00');
    agregarCompra(harness, 2);
    agregarRepuesto(harness, 1, 3);
    agregarDetalle(harness, 1, 1, 3, '2.00');

    await harness.service.actualizar(1, { compraId: 2, costoUnitario: 2.25 });

    expect(harness.state.compras.map((row) => row.total)).toEqual([
      '0.00',
      '6.75',
    ]);
    expect(harness.state.repuestos[0].stock).toBe(3);
    expect(harness.state.detalles[0].costoUnitario).toBe('2.25');
    expect(harness.lockOrders).toContain('Compra:1');
    expect(harness.lockOrders).toContain('Compra:2');
  });

  it('elimina y recalcula; si el stock quedaría negativo revierte toda la operación', async () => {
    const harness = crearHarness();
    agregarCompra(harness, 1, '8.00');
    agregarRepuesto(harness, 1, 1);
    agregarDetalle(harness, 1, 1, 2, '4.00');

    await expect(harness.service.eliminar(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(harness.state.repuestos[0].stock).toBe(1);
    expect(harness.state.compras[0].total).toBe('8.00');
    expect(harness.state.detalles).toHaveLength(1);
  });

  it('revierte stock y detalle si el total excede DECIMAL(10,2)', async () => {
    const harness = crearHarness();
    agregarCompra(harness, 1, '90000000.00');
    agregarRepuesto(harness, 1, 0);
    agregarDetalle(harness, 1, 1, 1, '90000000.00');

    await expect(
      harness.service.crear({
        compraId: 1,
        repuestoId: 1,
        cantidad: 1,
        costoUnitario: 10000000,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(harness.state.repuestos[0].stock).toBe(0);
    expect(harness.state.detalles).toHaveLength(1);
    expect(harness.state.compras[0].total).toBe('90000000.00');
  });
});
