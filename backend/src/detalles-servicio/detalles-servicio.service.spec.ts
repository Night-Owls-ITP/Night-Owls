import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/authenticated-user';
import { Factura } from '../facturas/factura.entity';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Servicio } from '../servicios/servicio.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { UserRole } from '../usuarios/user-role.enum';
import { DetalleServicio } from './detalle-servicio.entity';
import { DetallesServicioService } from './detalles-servicio.service';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

describe('DetallesServicioService', () => {
  const detalleRepository = {
    create: jest.fn((values: Partial<DetalleServicio>) => values),
    save: jest.fn((detalle) => Promise.resolve(detalle)),
  } as unknown as Repository<DetalleServicio>;
  const ordenRepository = {
    findOne: jest.fn(),
  } as unknown as Repository<OrdenTrabajo>;
  const servicioRepository = {
    findOne: jest.fn(),
  } as unknown as Repository<Servicio>;
  const service = new DetallesServicioService(
    detalleRepository,
    ordenRepository,
    servicioRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza referencias inexistentes', async () => {
    (ordenRepository.findOne as jest.Mock).mockResolvedValue(null);
    await expect(
      service.crear({ ordenTrabajoId: 1, servicioId: 2, cantidad: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);

    (ordenRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (servicioRepository.findOne as jest.Mock).mockResolvedValue(null);
    await expect(
      service.crear({ ordenTrabajoId: 1, servicioId: 2, cantidad: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('congela el precio base y calcula el subtotal exacto a centavos', async () => {
    const servicio = { id: 2, activo: true, precioBase: '19.95' };
    (ordenRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (servicioRepository.findOne as jest.Mock).mockResolvedValue(servicio);

    const resultado = await service.crear({
      ordenTrabajoId: 1,
      servicioId: 2,
      cantidad: 3,
    });
    servicio.precioBase = '99.99';

    expect(resultado.precioUnitario).toBe('19.95');
    expect(resultado.subtotal).toBe('59.85');
  });

  it('permite al mecánico su orden y rechaza la orden de otro mecánico', async () => {
    const usuarioRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 7,
        mecanico: { id: 42, activo: true },
      }),
    } as unknown as Repository<Usuario>;
    const orderRepository = {
      findOne: jest
        .fn()
        .mockImplementation(({ where }: { where: { id: number } }) =>
          Promise.resolve({
            id: where.id,
            mecanico: { id: where.id === 1 ? 42 : 87, activo: true },
          }),
        ),
    } as unknown as Repository<OrdenTrabajo>;
    const serviceRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 2, activo: true, precioBase: '5.00' }),
    } as unknown as Repository<Servicio>;
    const detailRepository = {
      create: jest.fn((values) => values),
      save: jest.fn((values) => Promise.resolve(values)),
    } as unknown as Repository<DetalleServicio>;
    const service = new DetallesServicioService(
      detailRepository,
      orderRepository,
      serviceRepository,
      { findOne: jest.fn().mockResolvedValue(null) } as unknown as Repository<Factura>,
      usuarioRepository,
    );
    const principal: AuthenticatedUser = {
      id: 7,
      nombre: 'Mecánico',
      email: 'mecanico@example.test',
      rol: UserRole.MECANICO,
    };

    await expect(
      service.crear(
        { ordenTrabajoId: 1, servicioId: 2, cantidad: 1 },
        principal,
      ),
    ).resolves.toMatchObject({ ordenTrabajo: { id: 1 }, subtotal: '5.00' });
    await expect(
      service.crear(
        { ordenTrabajoId: 2, servicioId: 2, cantidad: 1 },
        principal,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
