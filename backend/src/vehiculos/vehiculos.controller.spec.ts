import { Test, TestingModule } from '@nestjs/testing';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { Vehiculo } from './vehiculo.entity';

describe('VehiculosController', () => {
  let controller: VehiculosController;
  let vehiculosService: {
    crear: jest.Mock;
    obtenerPorId: jest.Mock;
  };

  beforeEach(async () => {
    vehiculosService = {
      crear: jest.fn(),
      obtenerPorId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiculosController],
      providers: [{ provide: VehiculosService, useValue: vehiculosService }],
    }).compile();

    controller = module.get<VehiculosController>(VehiculosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('pasa el DTO al servicio y devuelve el vehículo creado', async () => {
    const createVehiculoDto: CreateVehiculoDto = {
      clienteId: 7,
      placa: 'ABC1234',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2022,
      color: 'Azul',
    };
    const vehiculo = { id: 10 } as Vehiculo;
    vehiculosService.crear.mockResolvedValue(vehiculo);

    await expect(controller.crear(createVehiculoDto)).resolves.toBe(vehiculo);

    expect(vehiculosService.crear).toHaveBeenCalledWith(createVehiculoDto);
  });

  it('pasa el ID al servicio y devuelve el vehículo encontrado', async () => {
    const vehiculo = { id: 12 } as Vehiculo;
    vehiculosService.obtenerPorId.mockResolvedValue(vehiculo);

    await expect(controller.obtenerPorId(12)).resolves.toBe(vehiculo);

    expect(vehiculosService.obtenerPorId).toHaveBeenCalledWith(12);
  });
});
