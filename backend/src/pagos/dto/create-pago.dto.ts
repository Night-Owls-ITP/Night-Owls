import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreatePagoDto {
  @IsInt()
  @Min(1)
  facturaId!: number;

  @IsInt()
  @Min(1)
  valor!: number;

  @IsDateString()
  fecha!: string;

  @IsEnum(['efectivo', 'transferencia', 'tarjeta'])
  metodo!: string;

  @IsOptional()
  @IsString()
  @Length(0, 150)
  referencia?: string | null;
}
