import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Repuesto } from '../repuestos/repuesto.entity';

@Entity('detalles_repuesto')
@Check('CHK_detalles_repuesto_cantidad_positiva', '`cantidad` > 0')
@Check('CHK_detalles_repuesto_precio_no_negativo', '`precioUnitario` >= 0')
export class DetalleRepuesto {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => OrdenTrabajo, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ordenTrabajoId' })
  ordenTrabajo!: OrdenTrabajo;

  @RelationId((detalle: DetalleRepuesto) => detalle.ordenTrabajo)
  ordenTrabajoId!: number;

  @ManyToOne(() => Repuesto, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'repuestoId' })
  repuesto!: Repuesto;

  @RelationId((detalle: DetalleRepuesto) => detalle.repuesto)
  repuestoId!: number;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario!: string;
}
