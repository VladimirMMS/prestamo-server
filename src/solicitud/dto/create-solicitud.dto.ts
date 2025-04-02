import { IsInt, IsEnum, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { Frecuencia } from '../interfaces/solicitud-frecuencia.interface';

export class CreateLoanRequestDto {
  @IsInt()
  userId: number;

  @IsInt()
  bankAccountId: number;

  @IsNumber()
  @Min(0)
  amountRequested: number;

  @IsInt()
  @Min(1)
  termInMonths: number;

  @IsEnum(Frecuencia)
  paymentFrequency: Frecuencia;

  @IsNumber()
  @Min(0)
  totalLoanAmount: number;

  @IsInt()
  @Min(1)
  installments: number;

  @IsNumber()
  @Min(0)
  installmentAmount: number;

  @IsNotEmpty({ message: 'El tipo de interés es obligatorio' })
  interestRate: number;
}
