import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';
import { EstadoCita } from '../estado-cita.enum';

export class CreateCitaDto {
  @IsInt()
  @Min(1)
  vehiculoId!: number;

  @IsDateString({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/i, {
    message: 'fechaHora debe incluir zona horaria (Z o ±HH:mm)',
  })
  fechaHora!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 500)
  motivo!: string;

  @ValidateIf((_cita, value) => value !== undefined)
  @IsEnum(EstadoCita)
  estado?: EstadoCita;

  @ValidateIf((_cita, value) => value !== undefined && value !== null)
  @IsInt()
  @Min(1)
  ordenTrabajoId?: number | null;
}
