import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdatePagoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  facturaId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  valor?: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsEnum(['efectivo', 'transferencia', 'tarjeta'])
  metodo?: string;

  @IsOptional()
  @IsString()
  @Length(0, 150)
  referencia?: string | null;
}
