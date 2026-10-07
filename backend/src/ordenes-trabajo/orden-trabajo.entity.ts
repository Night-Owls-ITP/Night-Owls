import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Factura } from '../facturas/factura.entity';
import { Mecanico } from '../mecanicos/mecanico.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { DetalleRepuesto } from '../detalles-repuesto/detalle-repuesto.entity';

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

  @OneToOne(() => Factura, (factura) => factura.ordenTrabajo, {
    nullable: true,
  })
  factura?: Factura | null;

  @OneToMany(() => DetalleRepuesto, (detalle) => detalle.ordenTrabajo)
  detallesRepuesto!: DetalleRepuesto[];
}