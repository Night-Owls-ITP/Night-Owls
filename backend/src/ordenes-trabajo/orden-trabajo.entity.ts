import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ordenes_trabajo')
export class OrdenTrabajo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'int',
  })
  vehiculoId!: number;

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
}