
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('auditoria')
export class Auditoria {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({
    name: 'tabla_afectada',
    type: 'varchar',
    length: 100,
  })
  tablaAfectada!: string;

  @Column({
    name: 'registro_id',
    type: 'bigint',
  })
  registroId!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  usuario!: string;

  @Column({
    type: 'enum',
    enum: ['INSERT', 'UPDATE', 'DELETE'],
  })
  accion!: 'INSERT' | 'UPDATE' | 'DELETE';

  @CreateDateColumn({
    name: 'fecha_hora',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaHora!: Date;

  @Column({
    name: 'datos_anteriores',
    type: 'json',
    nullable: true,
  })
  datosAnteriores!: Record<string, unknown> | null;

  @Column({
    name: 'datos_nuevos',
    type: 'json',
    nullable: true,
  })
  datosNuevos!: Record<string, unknown> | null;
}
