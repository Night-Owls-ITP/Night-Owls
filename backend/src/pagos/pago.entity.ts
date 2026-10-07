import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Factura } from '../facturas/factura.entity';

@Entity('pagos')
@Check('CHK_pagos_valor_positivo', '`valor` > 0')
export class Pago {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Factura, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'facturaId' })
  factura!: Factura;

  @RelationId((pago: Pago) => pago.factura)
  facturaId!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor!: string;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'varchar', length: 30 })
  metodo!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  referencia!: string | null;
}
