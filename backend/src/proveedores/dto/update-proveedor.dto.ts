import {
  IsBoolean,
  IsEmail,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class UpdateProveedorDto {
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @Length(1, 150)
  nombre?: string;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @Length(1, 30)
  nit?: string;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @Length(1, 30)
  telefono?: string;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsEmail()
  @Length(1, 254)
  email?: string;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @Length(1, 255)
  direccion?: string;

  @ValidateIf((_dto, value) => value !== undefined)
  @IsBoolean()
  activo?: boolean;
}
