import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';

@Entity('vehiculos')
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 10,
    unique: true,
  })
  placa!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  marca!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  modelo!: string;

  @Column({
    type: 'int',
  })
  anio!: number;

  @Column({
    type: 'varchar',
    length: 30,
  })
  color!: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.vehiculos, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'clienteId' })
  cliente!: Cliente;

  @RelationId((vehiculo: Vehiculo) => vehiculo.cliente)
  clienteId!: number;

  @OneToMany(() => OrdenTrabajo, (orden) => orden.vehiculo)
  ordenesTrabajo!: OrdenTrabajo[];
}