import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Mecanico } from '../mecanicos/mecanico.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { OrdenTrabajo } from './orden-trabajo.entity';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { Usuario } from '../usuarios/usuario.entity';
import { UserRole } from '../usuarios/user-role.enum';
import { AuthenticatedUser } from '../auth/authenticated-user';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

describe('OrdenesTrabajoService mechanic assignment', () => {
  const ordenRepository = {
    create: jest.fn((values: Partial<OrdenTrabajo>) => values),
    save: jest.fn((orden) => Promise.resolve(orden)),
    findOne: jest.fn(),
  } as unknown as Repository<OrdenTrabajo>;
  const vehiculoRepository = {
    findOne: jest.fn(),
  } as unknown as Repository<Vehiculo>;
  const mecanicoRepository = {
    findOne: jest.fn(),
  } as unknown as Repository<Mecanico>;
  const service = new OrdenesTrabajoService(
    ordenRepository,
    vehiculoRepository,
    mecanicoRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (vehiculoRepository.findOne as jest.Mock).mockResolvedValue({ id: 2 });
    (ordenRepository.findOne as jest.Mock).mockResolvedValue({
      id: 8,
      mecanico: { id: 4, activo: true },
    });
  });

  const datos = {
    vehiculoId: 2,
    mecanicoId: 4,
    descripcion: 'Cambio de aceite y filtro',
    estado: 'pendiente',
    costo: 0,
    fecha: '2026-10-05',
  };

  it.each([null, { id: 4, activo: false }])(
    'rechaza un mecánico inexistente o inactivo: %p',
    async (mecanico) => {
      (mecanicoRepository.findOne as jest.Mock).mockImplementation(
        (options: { where: { id: number; activo: boolean } }) => {
          expect(options.where).toEqual({
            id: datos.mecanicoId,
            activo: true,
          });
          return Promise.resolve(mecanico?.activo ? mecanico : null);
        },
      );
      await expect(service.crear(datos)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect((ordenRepository.save as jest.Mock).mock.calls).toHaveLength(0);
    },
  );

  it('asigna un mecánico activo y permite quitarlo mediante PATCH', async () => {
    const mecanico = { id: 4, activo: true };
    (mecanicoRepository.findOne as jest.Mock).mockResolvedValue(mecanico);
    const creada = await service.crear(datos);
    expect(creada.mecanico).toBe(mecanico);

    (ordenRepository.findOne as jest.Mock).mockResolvedValue({
      id: 8,
      mecanico,
    });
    const actualizada = await service.actualizar(8, { mecanicoId: null });
    expect(actualizada.mecanico).toBeNull();
  });

  it('filtra órdenes usando el mecánico de la cuenta autenticada', async () => {
    const mecanicoId = 42;
    const usuarioId = 17;
    const usuarioRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: usuarioId,
        mecanico: { id: mecanicoId, activo: true },
      }),
    } as unknown as Repository<Usuario>;
    const ordenesRepository = {
      find: jest.fn().mockResolvedValue([{ id: 9 }]),
      findOne: jest.fn().mockResolvedValue(null),
    } as unknown as Repository<OrdenTrabajo>;
    const accesoService = new OrdenesTrabajoService(
      ordenesRepository,
      vehiculoRepository,
      mecanicoRepository,
      usuarioRepository,
    );
    const principal: AuthenticatedUser = {
      id: usuarioId,
      nombre: 'Mecánico',
      email: 'mecanico@example.test',
      rol: UserRole.MECANICO,
    };

    await accesoService.obtenerTodas(principal);

    expect(ordenesRepository.find).toHaveBeenCalledWith({
      where: { mecanico: { id: mecanicoId } },
    });
  });

  it('rechaza consultas de una orden ajena al mecánico autenticado', async () => {
    const usuarioRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 17,
        mecanico: { id: 42, activo: true },
      }),
    } as unknown as Repository<Usuario>;
    const ordenesRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    } as unknown as Repository<OrdenTrabajo>;
    const accesoService = new OrdenesTrabajoService(
      ordenesRepository,
      vehiculoRepository,
      mecanicoRepository,
      usuarioRepository,
    );
    const principal: AuthenticatedUser = {
      id: 17,
      nombre: 'Mecánico',
      email: 'mecanico@example.test',
      rol: UserRole.MECANICO,
    };

    await expect(
      accesoService.obtenerPorId(99, principal),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(ordenesRepository.findOne).toHaveBeenCalledWith({
      where: { id: 99, mecanico: { id: 42 } },
    });
  });
});
