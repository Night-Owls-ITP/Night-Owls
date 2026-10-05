import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mecanicos')
export class Mecanico {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  documento!: string;

  @Column({ type: 'varchar', length: 50 })
  telefono!: string;

  @Column({ type: 'varchar', length: 100 })
  especialidad!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;
}
