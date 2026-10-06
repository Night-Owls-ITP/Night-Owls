import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Repuesto } from './repuesto.entity';
import { RepuestosService } from './repuestos.service';

jest.mock('@nestjs/typeorm', () => ({
  InjectDataSource: () => () => undefined,
  InjectRepository: () => () => undefined,
}));

describe('RepuestosService', () => {
  it('devuelve conflicto al crear un código duplicado', async () => {
    const error = Object.assign(new Error('duplicate'), {
      driverError: { code: 'ER_DUP_ENTRY', errno: 1062 },
    });
    const repository = {
      create: jest.fn((values) => values),
      save: jest.fn().mockRejectedValue(error),
    } as unknown as Repository<Repuesto>;
    const service = new RepuestosService(repository, {} as never);

    await expect(
      service.crear({
        codigo: 'FILTRO-01',
        nombre: 'Filtro',
        descripcion: 'Filtro de aceite',
        precioVenta: 10,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ stock: 0, activo: true, precioVenta: '10.00' }),
    );
  });

  it('actualiza solo columnas del catálogo y nunca reescribe stock', async () => {
    const repuesto = { id: 1, nombre: 'Filtro', stock: 12 } as Repuesto;
    const repository = {
      findOne: jest.fn().mockResolvedValue(repuesto),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    } as unknown as Repository<Repuesto>;
    const service = new RepuestosService(repository, {} as never);

    await service.actualizar(1, { nombre: 'Filtro nuevo' });

    expect(repository.update).toHaveBeenCalledWith(1, {
      nombre: 'Filtro nuevo',
    });
  });
});
