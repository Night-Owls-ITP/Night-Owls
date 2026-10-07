import {
  Check,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DetalleCompra } from '../detalles-compra/detalle-compra.entity';
import { DetalleRepuesto } from '../detalles-repuesto/detalle-repuesto.entity';

@Entity('repuestos')
@Index('UQ_repuestos_codigo', ['codigo'], { unique: true })
@Check('CHK_repuestos_stock_no_negativo', '`stock` >= 0')
@Check('CHK_repuestos_precio_no_negativo', '`precioVenta` >= 0')
export class Repuesto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  codigo!: string;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'varchar', length: 500 })
  descripcion!: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioVenta!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @OneToMany(() => DetalleCompra, (detalle) => detalle.repuesto)
  detallesCompra!: DetalleCompra[];

  @OneToMany(() => DetalleRepuesto, (detalle) => detalle.repuesto)
  detallesRepuesto!: DetalleRepuesto[];
}
