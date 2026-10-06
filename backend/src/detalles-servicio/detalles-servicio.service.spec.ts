import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Servicio } from '../servicios/servicio.entity';
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
});
