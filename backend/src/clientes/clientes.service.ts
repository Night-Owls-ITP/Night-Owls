import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Cliente } from './cliente.entity';

@Injectable()
export class ClientesService {
  private clientes: Cliente[] = [];
  private id = 1;

  create(createClienteDto: CreateClienteDto) {
    const cliente = {
      id: this.id++,
      ...createClienteDto,
    };

    this.clientes.push(cliente);

    return cliente;
  }

  findAll() {
    return this.clientes;
  }

  findOne(id: number) {
    const cliente = this.clientes.find(
      (cliente) => cliente.id === id,
    );

    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${id} no encontrado`,
      );
    }

    return cliente;
  }

  update(id: number, updateClienteDto: UpdateClienteDto) {
    const cliente = this.findOne(id);

    Object.assign(cliente, updateClienteDto);

    return cliente;
  }

  remove(id: number) {
    const cliente = this.findOne(id);

    this.clientes = this.clientes.filter(
      (cliente) => cliente.id !== id,
    );

    return {
      message: 'Cliente eliminado correctamente',
      cliente,
    };
  }
}