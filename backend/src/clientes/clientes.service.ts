import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cliente } from './cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async crear(
    createClienteDto: CreateClienteDto,
  ): Promise<Cliente> {
    const cliente = this.clienteRepository.create(
      createClienteDto,
    );

    return await this.clienteRepository.save(cliente);
  }

  async obtenerTodos(): Promise<Cliente[]> {
    return await this.clienteRepository.find();
  }

  async obtenerPorId(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: {
        id,
      },
    });

    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${id} no encontrado`,
      );
    }

    return cliente;
  }

  async actualizar(
    id: number,
    datos: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.obtenerPorId(id);

    Object.assign(cliente, datos);

    return await this.clienteRepository.save(cliente);
  }

  async eliminar(id: number) {
    const cliente = await this.obtenerPorId(id);

    await this.clienteRepository.remove(cliente);

    return {
      message: 'Cliente eliminado correctamente',
    };
  }
}