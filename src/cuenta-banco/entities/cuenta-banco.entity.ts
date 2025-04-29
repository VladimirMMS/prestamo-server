import { LoanRequest } from 'src/solicitud/entities/solicitud.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { CurrencyType } from '../interfaces/moneyType.interface';
import { AccountType } from '../interfaces/accountType.interface';

@Entity()
export class BankAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  accountNumber: string;

  @Column({ length: 100 })
  bankName: string;

  @Column({ default: false, nullable: true })
  isDeleted: boolean;

  @Column({ nullable: true, enum: AccountType })
  accountType: AccountType;

  @Column({ nullable: true, enum: CurrencyType })
  currencyType: CurrencyType;

  @ManyToOne(() => User, (user) => user.bankAccounts, { nullable: false })
  user: User;

  @OneToMany(() => LoanRequest, (loan) => loan.bankAccount)
  loan: LoanRequest[];
}
