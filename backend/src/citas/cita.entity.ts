import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { EstadoCita } from './estado-cita.enum';

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Vehiculo, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehiculoId' })
  vehiculo!: Vehiculo;

  @RelationId((cita: Cita) => cita.vehiculo)
  vehiculoId!: number;

  @Column({ type: 'datetime' })
  fechaHora!: Date;

  @Column({ type: 'varchar', length: 500 })
  motivo!: string;

  @Column({
    type: 'enum',
    enum: EstadoCita,
    default: EstadoCita.PENDIENTE,
  })
  estado!: EstadoCita;

  @OneToOne(() => OrdenTrabajo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ordenTrabajoId' })
  ordenTrabajo!: OrdenTrabajo | null;

  @RelationId((cita: Cita) => cita.ordenTrabajo)
  ordenTrabajoId!: number | null;
}
