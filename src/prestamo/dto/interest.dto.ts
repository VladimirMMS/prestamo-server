// src/dto/interes.dto.ts
import { IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class InteresDto {
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El monto debe ser un número con hasta 2 decimales.' },
  )
  amount: number;

  @IsNumber()
  userId: number;

  @IsBoolean()
  isDefault: boolean;
}
