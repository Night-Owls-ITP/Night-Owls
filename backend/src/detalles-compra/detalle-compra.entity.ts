import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Compra } from '../compras/compra.entity';
import { Repuesto } from '../repuestos/repuesto.entity';

@Entity('detalles_compra')
@Check('CHK_detalles_compra_cantidad_positiva', '`cantidad` > 0')
@Check('CHK_detalles_compra_costo_no_negativo', '`costoUnitario` >= 0')
export class DetalleCompra {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Compra, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'compraId' })
  compra!: Compra;

  @RelationId((detalle: DetalleCompra) => detalle.compra)
  compraId!: number;

  @ManyToOne(() => Repuesto, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'repuestoId' })
  repuesto!: Repuesto;

  @RelationId((detalle: DetalleCompra) => detalle.repuesto)
  repuestoId!: number;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costoUnitario!: string;
}
