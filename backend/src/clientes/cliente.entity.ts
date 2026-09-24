import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre!: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  documento!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  telefono!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  @OneToMany(() => Vehiculo, (vehiculo) => vehiculo.cliente)
  vehiculos!: Vehiculo[];
}