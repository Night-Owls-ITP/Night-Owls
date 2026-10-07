import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuarios')
@Index('UQ_usuarios_email', ['email'], { unique: true })
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'varchar', length: 254 })
  email!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 30 })
  rol!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;
}
