import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Mecanico } from '../mecanicos/mecanico.entity';
import { UserRole } from './user-role.enum';

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

  @Column({ type: 'enum', enum: UserRole })
  rol!: UserRole;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @OneToOne(() => Mecanico, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mecanicoId' })
  mecanico?: Mecanico | null;

  @RelationId((usuario: Usuario) => usuario.mecanico)
  mecanicoId!: number | null;
}
