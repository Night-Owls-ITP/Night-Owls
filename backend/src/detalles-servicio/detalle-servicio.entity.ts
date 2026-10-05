import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  RelationId,
} from 'typeorm';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Servicio } from '../servicios/servicio.entity';

@Entity('detalles_servicio')
export class DetalleServicio {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => OrdenTrabajo, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordenTrabajoId' })
  ordenTrabajo!: OrdenTrabajo;

  @RelationId((detalle: DetalleServicio) => detalle.ordenTrabajo)
  ordenTrabajoId!: number;

  @ManyToOne(() => Servicio, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'servicioId' })
  servicio!: Servicio;

  @RelationId((detalle: DetalleServicio) => detalle.servicio)
  servicioId!: number;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario!: string;
}
