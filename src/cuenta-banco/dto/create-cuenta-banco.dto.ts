import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { AccountType } from '../interfaces/accountType.interface';
import { CurrencyType } from '../interfaces/moneyType.interface';

export class CreateBankAccountDto {
  @IsString()
  @Length(5, 50)
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @Length(3, 100)
  @IsNotEmpty()
  bankName: string;

  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  accountType: AccountType;

  @IsString()
  @IsNotEmpty()
  currencyType: CurrencyType;
}
