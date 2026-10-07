import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { UsuariosService } from './usuarios.service';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

describe('UsuariosService', () => {
  it('guarda contraseñas como hash y no devuelve passwordHash en la respuesta', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((values) => values),
      save: jest.fn(async (values) => ({
        ...values,
        id: 1,
      })),
    } as unknown as Repository<Usuario>;

    const service = new UsuariosService(repo, {} as never);
    const resultado = await service.crear({
      nombre: 'Ana García',
      email: 'ANA@EXAMPLE.COM',
      password: 'secreto123',
      rol: 'recepcionista',
    });

    expect(resultado).toEqual(
      expect.objectContaining({
        id: 1,
        nombre: 'Ana García',
        email: 'ana@example.com',
        rol: 'recepcionista',
      }),
    );
    expect(resultado).not.toHaveProperty('passwordHash');
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ana@example.com',
      }),
    );
  });

  it('rechaza emails duplicados', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue({ id: 1, email: 'ana@example.com' }),
    } as unknown as Repository<Usuario>;

    const service = new UsuariosService(repo, {} as never);

    await expect(
      service.crear({
        nombre: 'Ana García',
        email: 'ana@example.com',
        password: 'secreto123',
        rol: 'mecanico',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
