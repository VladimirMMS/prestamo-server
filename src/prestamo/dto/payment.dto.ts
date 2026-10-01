import { IsNumber, IsEnum, IsInt, Min } from 'class-validator';
import { PayType } from '../types/pay.type';

export class PaymentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PayType)
  type: PayType;

  @IsInt()
  @Min(1)
  loanId: number;
}
