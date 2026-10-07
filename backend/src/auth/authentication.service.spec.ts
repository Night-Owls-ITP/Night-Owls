import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { UserRole } from '../usuarios/user-role.enum';
import { AuthenticationService } from './authentication.service';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

describe('AuthenticationService', () => {
  const passwordHash = bcrypt.hashSync('correct horse battery', 4);

  function createService(usuario: Partial<Usuario> | null) {
    const query = {
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(usuario),
    };
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(query),
    } as unknown as Repository<Usuario>;

    return {
      service: new AuthenticationService(repository),
      query,
    };
  }

  it('normaliza el correo, selecciona el hash y devuelve una identidad sin secretos', async () => {
    const { service, query } = createService({
      id: 4,
      nombre: 'Técnico',
      email: 'mecanico@example.test',
      rol: UserRole.RECEPCIONISTA,
      activo: true,
      passwordHash,
    });

    await expect(
      service.authenticate(' MECANICO@EXAMPLE.TEST ', 'correct horse battery'),
    ).resolves.toEqual({
      id: 4,
      nombre: 'Técnico',
      email: 'mecanico@example.test',
      rol: UserRole.RECEPCIONISTA,
    });
    expect(query.addSelect).toHaveBeenCalledWith('usuario.passwordHash');
    expect(query.where).toHaveBeenCalledWith('usuario.email = :email', {
      email: 'mecanico@example.test',
    });
  });

  it.each([
    [null, 'correct horse battery'],
    [{ id: 1, activo: false, passwordHash }, 'correct horse battery'],
    [{ id: 1, activo: true, passwordHash }, 'wrong password'],
    [
      {
        id: 1,
        activo: true,
        passwordHash,
        rol: UserRole.MECANICO,
        mecanico: null,
      },
      'correct horse battery',
    ],
    [
      {
        id: 1,
        activo: true,
        passwordHash,
        rol: UserRole.MECANICO,
        mecanico: { id: 8, activo: false },
      },
      'correct horse battery',
    ],
  ])('rechaza una cuenta o contraseña no válida', async (usuario, password) => {
    const { service } = createService(usuario);
    await expect(
      service.authenticate('user@example.test', password as string),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
