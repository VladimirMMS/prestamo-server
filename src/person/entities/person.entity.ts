import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PersonDocumento } from './person-documento.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('person')
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  names: string;

  @Column()
  lastNames: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @OneToMany(() => PersonDocumento, (personDocument) => personDocument.person)
  personDocument: PersonDocumento[];

  @OneToOne(() => User, (user) => user.person)
  user: User;
}
