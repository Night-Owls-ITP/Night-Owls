import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { DetalleCompra } from '../detalles-compra/detalle-compra.entity';
import { Proveedor } from '../proveedores/proveedor.entity';

@Entity('compras')
@Check('CHK_compras_total_no_negativo', '`total` >= 0')
export class Compra {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Proveedor, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'proveedorId' })
  proveedor!: Proveedor;

  @RelationId((compra: Compra) => compra.proveedor)
  proveedorId!: number;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0.00' })
  total!: string;

  @OneToMany(() => DetalleCompra, (detalle) => detalle.compra)
  detalles!: DetalleCompra[];
}
