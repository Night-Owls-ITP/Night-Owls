import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'varchar', length: 500 })
  descripcion!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioBase!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;
}
