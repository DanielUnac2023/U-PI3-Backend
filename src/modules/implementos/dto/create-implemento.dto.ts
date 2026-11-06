import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class CreateImplementoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Min(1)
  stockTotal: number;

  @IsString()
  @IsOptional()
  categoria?: string;
}

export class SolicitarPrestamoDto {
  @IsInt()
  usuarioId: number;

  @IsInt()
  implementoId: number;
}

export class EntregarQrDto {
  @IsString()
  @IsNotEmpty()
  tokenQr: string;
}
