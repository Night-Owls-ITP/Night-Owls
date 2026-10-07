import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';

@Entity('facturas')
@Index('UQ_facturas_numero', ['numero'], { unique: true })
@Check('CHK_facturas_total_no_negativo', '`total` >= 0')
export class Factura {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  numero!: string;

  @OneToOne(() => OrdenTrabajo, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ordenTrabajoId' })
  ordenTrabajo!: OrdenTrabajo;

  @RelationId((factura: Factura) => factura.ordenTrabajo)
  ordenTrabajoId!: number;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0.00' })
  total!: string;
}
