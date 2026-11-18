import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cliente } from './cliente.entity';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

describe('ClientesService', () => {
  let service: ClientesService;
  let clienteRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    clienteRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        {
          provide: getRepositoryToken(Cliente),
          useValue: clienteRepository,
        },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
  });

  it('crea y guarda el cliente y devuelve el resultado del repositorio', async () => {
    const createClienteDto: CreateClienteDto = {
      nombre: 'Carlos Cliente',
      documento: 'DOC-12',
      telefono: '3000000012',
      email: 'carlos@example.test',
    };
    const clienteCreado = Object.assign(new Cliente(), {
      ...createClienteDto,
    });
    const clienteGuardado = Object.assign(new Cliente(), {
      ...clienteCreado,
      id: 12,
    });
    clienteRepository.create.mockReturnValue(clienteCreado);
    clienteRepository.save.mockResolvedValue(clienteGuardado);

    await expect(service.crear(createClienteDto)).resolves.toBe(
      clienteGuardado,
    );
    expect(clienteRepository.create).toHaveBeenCalledWith(createClienteDto);
    expect(clienteRepository.save).toHaveBeenCalledWith(clienteCreado);
  });

  it('lanza NotFoundException cuando findOne no encuentra el cliente', async () => {
    clienteRepository.findOne.mockResolvedValue(null);

    await expect(service.obtenerPorId(42)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(clienteRepository.findOne).toHaveBeenCalledWith({
      where: { id: 42 },
    });
  });
});
