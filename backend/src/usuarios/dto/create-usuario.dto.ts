import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @Length(1, 150)
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(['administrador', 'recepcionista', 'mecanico'])
  rol!: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
