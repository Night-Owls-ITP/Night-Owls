import { NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Compra } from './compra.entity';
import { ComprasService } from './compras.service';
import { Proveedor } from '../proveedores/proveedor.entity';

jest.mock('@nestjs/typeorm', () => ({
  InjectDataSource: () => () => undefined,
  InjectRepository: () => () => undefined,
}));

describe('ComprasService', () => {
  it('rechaza proveedores inexistentes/inactivos y calcula total inicial en el servidor', async () => {
    const proveedor = { id: 4, activo: true } as Proveedor;
    const proveedorRepo = { findOne: jest.fn() };
    const compraRepo = {
      create: jest.fn((values) => values),
      save: jest.fn((compra) => Promise.resolve({ id: 8, ...compra })),
    };
    const manager = {
      getRepository: (target: Function) =>
        target === Proveedor ? proveedorRepo : compraRepo,
    };
    const dataSource = {
      transaction: (callback: (tx: EntityManager) => Promise<unknown>) =>
        callback(manager as unknown as EntityManager),
    } as unknown as DataSource;
    const service = new ComprasService({} as Repository<Compra>, dataSource);

    proveedorRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(proveedor);
    await expect(
      service.crear({ proveedorId: 4, fecha: '2026-10-06' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    const compra = await service.crear({ proveedorId: 4, fecha: '2026-10-06' });

    expect(compra.total).toBe('0.00');
    expect(compraRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ proveedor, total: '0.00' }),
    );
  });
});
