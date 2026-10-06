import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Proveedor } from './proveedor.entity';
import { ProveedoresService } from './proveedores.service';

jest.mock('@nestjs/typeorm', () => ({
  InjectDataSource: () => () => undefined,
  InjectRepository: () => () => undefined,
}));

describe('ProveedoresService', () => {
  it('devuelve conflicto al crear un NIT duplicado', async () => {
    const error = Object.assign(new Error('duplicate'), {
      driverError: { code: 'ER_DUP_ENTRY', errno: 1062 },
    });
    const repository = {
      create: jest.fn((values) => values),
      save: jest.fn().mockRejectedValue(error),
    } as unknown as Repository<Proveedor>;
    const service = new ProveedoresService(repository, {} as never);

    await expect(
      service.crear({
        nombre: 'Proveedor',
        nit: 'NIT-1',
        telefono: '5550101',
        email: 'proveedor@example.com',
        direccion: 'Calle 1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
