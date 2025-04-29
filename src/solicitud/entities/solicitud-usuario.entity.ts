import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LoanRequest } from './solicitud.entity';

@Entity('loanRequestUser')
export class LoanRequestUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fechaSolicitud: Date;

  @ManyToOne(() => User, (user) => user.loanRequest, { nullable: false })
  user: User;

  @ManyToOne(() => LoanRequest, (loanRequest) => loanRequest.loanRequestUser, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  loanRequest: LoanRequest;
}
