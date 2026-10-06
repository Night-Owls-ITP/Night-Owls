import { IsEmail, IsString, Length } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @Length(1, 150)
  nombre!: string;

  @IsString()
  @Length(1, 30)
  nit!: string;

  @IsString()
  @Length(1, 30)
  telefono!: string;

  @IsEmail()
  @Length(1, 254)
  email!: string;

  @IsString()
  @Length(1, 255)
  direccion!: string;
}
