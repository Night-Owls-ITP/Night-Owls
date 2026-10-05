import { NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { Cita } from './cita.entity';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

describe('CitasService vehicle/order consistency', () => {
  const citaRepository = {
    create: jest.fn((values: Partial<Cita>) => values),
    save: jest.fn((cita) => Promise.resolve(cita)),
    findOne: jest.fn(),
  } as unknown as Repository<Cita>;
  const vehiculoRepository = {
    findOne: jest.fn(),
  } as unknown as Repository<Vehiculo>;
  const ordenRepository = {
    findOne: jest.fn(),
  } as unknown as Repository<OrdenTrabajo>;
  const service = new CitasService(
    citaRepository,
    vehiculoRepository,
    ordenRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (vehiculoRepository.findOne as jest.Mock).mockResolvedValue({ id: 3 });
    (ordenRepository.findOne as jest.Mock).mockResolvedValue({
      id: 10,
      vehiculo: { id: 4 },
    });
  });

  it('rechaza al crear una cita vinculada a una orden de otro vehículo', async () => {
    await expect(
      service.crear({
        vehiculoId: 3,
        ordenTrabajoId: 10,
        fechaHora: '2026-10-05T12:00:00.000Z',
        motivo: 'Mantenimiento preventivo',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('también valida la coherencia al actualizar la cita', async () => {
    (citaRepository.findOne as jest.Mock).mockResolvedValue({
      id: 5,
      vehiculo: { id: 3 },
      ordenTrabajo: null,
    });

    await expect(
      service.actualizar(5, { ordenTrabajoId: 10 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('Cita DTO timezone validation', () => {
  it.each([
    [CreateCitaDto, '2026-10-06T14:30:00.000Z'],
    [CreateCitaDto, '2026-10-06T08:30:00-06:00'],
    [UpdateCitaDto, '2026-10-06T14:30:00.000Z'],
    [UpdateCitaDto, '2026-10-06T08:30:00-06:00'],
  ])('accepts timezone-aware date %s %s', async (Dto, fechaHora) => {
    const dto = Object.assign(new Dto(), { fechaHora });
    const errors = await validate(dto);
    expect(
      errors.filter((error) => error.property === 'fechaHora'),
    ).toHaveLength(0);
  });

  it.each([CreateCitaDto, UpdateCitaDto])(
    'rejects a date without timezone for %s',
    async (Dto) => {
      const dto = Object.assign(new Dto(), {
        fechaHora: '2026-10-06T14:30:00',
      });
      const errors = await validate(dto);
      expect(errors.some((error) => error.property === 'fechaHora')).toBe(true);
    },
  );
});
