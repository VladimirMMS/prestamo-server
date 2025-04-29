import { LoanRequest } from 'src/solicitud/entities/solicitud.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { PaymentHistory } from './historial.entity';
import { StatusPrestamo } from '../interfaces/status.interface';
import { User } from 'src/user/entities/user.entity';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => LoanRequest, { nullable: false })
  @JoinColumn({ name: 'loanRequestId' })
  loanRequest: LoanRequest;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  approvedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  remainingBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  interestRate: number;

  @Column({ type: 'int' })
  termInMonths: number;

  @Column({ type: 'int' })
  installments: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  installmentAmount: number;

  @Column({
    type: 'enum',
    enum: StatusPrestamo,
    default: StatusPrestamo.ACTIVO,
  })
  status: StatusPrestamo;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  incomingPaymentDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountLatePayment: number;

  // Agrega estos campos (opcional si puedes modificar la DB)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.5 })
  latePaymentRate?: number; // Tasa de mora diaria (0.5%)

  @Column({ type: 'int', default: 1 })
  gracePeriodDays?: number; // D

  @OneToMany(() => PaymentHistory, (payment) => payment.loan, {
    cascade: true,
    eager: true,
  })
  paymentHistory: PaymentHistory[];

  @ManyToOne(() => User, (user) => user.loan)
  user: User;
}
