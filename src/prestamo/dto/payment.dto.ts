import { IsNumber, IsEnum } from 'class-validator';
import { PayType } from '../types/pay.type';

export class PaymentDto {
  @IsNumber()
  amount: number;

  @IsEnum(PayType)
  type: PayType;

  @IsNumber()
  loanId: number;
}
