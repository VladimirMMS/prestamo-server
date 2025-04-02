import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { BankAccount } from 'src/cuenta-banco/entities/cuenta-banco.entity';
import { Person } from 'src/person/entities/person.entity';
import { LoanRequest } from 'src/solicitud/entities/solicitud.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ enum: ValidRoles, type: 'enum' })
  role: ValidRoles;

  @Column()
  isActive: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @OneToOne(() => Person, (person) => person.user)
  @JoinColumn({ name: 'personId' })
  person: Person;

  @OneToMany(() => BankAccount, (bankAccount) => bankAccount.user)
  bankAccounts: BankAccount[];

  @OneToMany(() => LoanRequest, (loan) => loan.user)
  loanRequest: LoanRequest[];
}
