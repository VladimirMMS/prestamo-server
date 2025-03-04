import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { Person } from 'src/person/entities/person.entity';
import {
  Column,
  Entity,
  JoinColumn,
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
}
