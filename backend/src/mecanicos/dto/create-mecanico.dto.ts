import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateMecanicoDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  documento!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  telefono!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  especialidad!: string;
}
