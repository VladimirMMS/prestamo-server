import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Loan } from './prestamo.entity';
import { PayType } from '../types/pay.type';

@Entity('paymentHistory')
export class PaymentHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number;

  @CreateDateColumn()
  paymentdate: Date;

  @Column({ type: 'boolean', default: true, nullable: true })
  onTime: boolean;

  @Column({ type: 'enum', enum: PayType, default: PayType.CUOTA })
  payType: PayType;

  @ManyToOne(() => Loan, (loan) => loan.paymentHistory, { nullable: false })
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  @Column({ type: 'int', nullable: true })
  documentId: number;
}
