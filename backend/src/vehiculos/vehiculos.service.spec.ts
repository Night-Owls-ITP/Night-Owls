import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VehiculosService } from './vehiculos.service';
import { Vehiculo } from './vehiculo.entity';
import { Cliente } from '../clientes/cliente.entity';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { NotFoundException } from '@nestjs/common';

describe('VehiculosService', () => {
  let service: VehiculosService;
  let vehiculoRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let clienteRepository: {
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    vehiculoRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    clienteRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiculosService,
        {
          provide: getRepositoryToken(Vehiculo),
          useValue: vehiculoRepository,
        },
        {
          provide: getRepositoryToken(Cliente),
          useValue: clienteRepository,
        },
      ],
    }).compile();

    service = module.get<VehiculosService>(VehiculosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('asocia el cliente encontrado y guarda el vehículo', async () => {
    const cliente: Cliente = {
      id: 7,
      nombre: 'Cliente de prueba',
      documento: 'DOC-TEST-7',
      telefono: '3001234567',
      email: 'cliente7@example.test',
      vehiculos: [],
    };
    const createVehiculoDto: CreateVehiculoDto = {
      clienteId: cliente.id,
      placa: 'ABC1234',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2022,
      color: 'Azul',
    };
    const vehiculo = { ...createVehiculoDto, cliente } as Vehiculo;
    clienteRepository.findOne.mockResolvedValue(cliente);
    vehiculoRepository.create.mockReturnValue(vehiculo);
    vehiculoRepository.save.mockResolvedValue(vehiculo);

    await expect(service.crear(createVehiculoDto)).resolves.toBe(vehiculo);

    expect(clienteRepository.findOne).toHaveBeenCalledWith({
      where: { id: cliente.id },
    });
    expect(vehiculoRepository.create).toHaveBeenCalledWith({
      placa: createVehiculoDto.placa,
      marca: createVehiculoDto.marca,
      modelo: createVehiculoDto.modelo,
      anio: createVehiculoDto.anio,
      color: createVehiculoDto.color,
      cliente,
    });
    expect(vehiculoRepository.save).toHaveBeenCalledWith(vehiculo);
  });

  it('lanza NotFoundException y no guarda si el cliente no existe', async () => {
    const createVehiculoDto: CreateVehiculoDto = {
      clienteId: 999,
      placa: 'XYZ9876',
      marca: 'Honda',
      modelo: 'Civic',
      anio: 2021,
      color: 'Negro',
    };
    clienteRepository.findOne.mockResolvedValue(null);

    await expect(service.crear(createVehiculoDto)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(vehiculoRepository.save).not.toHaveBeenCalled();
  });
});
