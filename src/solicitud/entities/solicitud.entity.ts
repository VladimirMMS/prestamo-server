import { BankAccount } from 'src/cuenta-banco/entities/cuenta-banco.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Status } from '../interfaces/solicitud-status.interface';
import { Frecuencia } from '../interfaces/solicitud-frecuencia.interface';
import { MotivosRechazo } from './motivos.entity';

@Entity('loanRequests')
export class LoanRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountRequested: number;

  @Column({ type: 'int' })
  termInMonths: number;

  @Column({
    type: 'enum',
    enum: Frecuencia,
    default: Frecuencia.mensual,
  })
  paymentFrequency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalLoanAmount: number;

  @Column({ type: 'int' })
  installments: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  installmentAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  interestRate: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Pendiente,
  })
  status: Status;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.loanRequest, { nullable: false })
  user: User;

  @OneToOne(() => BankAccount, (bankAccount) => bankAccount.loan)
  @JoinColumn({ name: 'bankAccountId', referencedColumnName: 'id' })
  bankAccount: BankAccount;

  @OneToMany(() => MotivosRechazo, (motivo) => motivo.solicitud)
  motivos: MotivosRechazo[];
}
