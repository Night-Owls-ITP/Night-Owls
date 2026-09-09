import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('vehiculos')
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 10,
    unique: true,
  })
  placa!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  marca!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  modelo!: string;

  @Column({
    type: 'int',
  })
  anio!: number;

  @Column({
    type: 'varchar',
    length: 30,
  })
  color!: string;
}