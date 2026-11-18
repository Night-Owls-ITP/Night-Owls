import { Test, TestingModule } from '@nestjs/testing';
import { Cliente } from './cliente.entity';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

describe('ClientesController', () => {
  let controller: ClientesController;
  let clientesService: {
    obtenerTodos: jest.Mock;
    obtenerPorId: jest.Mock;
  };

  beforeEach(async () => {
    clientesService = {
      obtenerTodos: jest.fn(),
      obtenerPorId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientesController],
      providers: [{ provide: ClientesService, useValue: clientesService }],
    }).compile();

    controller = module.get<ClientesController>(ClientesController);
  });

  it('delega obtenerTodos al servicio y devuelve su lista', async () => {
    const clientes = [
      Object.assign(new Cliente(), {
        id: 1,
        nombre: 'Ana Cliente',
        documento: 'DOC-1',
        telefono: '3000000001',
        email: 'ana@example.test',
      }),
    ];
    clientesService.obtenerTodos.mockResolvedValue(clientes);

    await expect(controller.obtenerTodos()).resolves.toBe(clientes);
    expect(clientesService.obtenerTodos).toHaveBeenCalledTimes(1);
  });

  it('pasa el ID a obtenerPorId y devuelve el cliente', async () => {
    const cliente = Object.assign(new Cliente(), {
      id: 7,
      nombre: 'Luis Cliente',
      documento: 'DOC-7',
      telefono: '3000000007',
      email: 'luis@example.test',
    });
    clientesService.obtenerPorId.mockResolvedValue(cliente);

    await expect(controller.obtenerPorId(7)).resolves.toBe(cliente);
    expect(clientesService.obtenerPorId).toHaveBeenCalledWith(7);
  });
});
