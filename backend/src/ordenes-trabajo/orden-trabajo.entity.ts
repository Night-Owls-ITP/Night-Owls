import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { Mecanico } from '../mecanicos/mecanico.entity';

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

  @RelationId((orden: OrdenTrabajo) => orden.vehiculo)
  vehiculoId!: number;

  @ManyToOne(() => Mecanico, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'mecanicoId' })
  mecanico!: Mecanico | null;

  @RelationId((orden: OrdenTrabajo) => orden.mecanico)
  mecanicoId!: number | null;

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