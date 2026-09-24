import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

@Entity('ordenes_trabajo')
export class OrdenTrabajo {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.ordenesTrabajo, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'vehiculoId' })
  vehiculo!: Vehiculo;

  @Column({
    type: 'varchar',
    length: 255,
  })
  descripcion!: string;

  @Column({
    type: 'varchar',
    length: 30,
  })
  estado!: string;

  @Column({
    type: 'int',
  })
  costo!: number;

  @Column({
    type: 'date',
  })
  fecha!: string;
}