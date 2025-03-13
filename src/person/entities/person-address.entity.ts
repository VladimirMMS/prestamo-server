import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Province } from 'src/country/entities/province.entity';
import { Person } from './person.entity';

@Entity('personAddress')
export class PersonAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @ManyToOne(() => Province, (province) => province.personAddress)
  province: Province;

  @OneToOne(() => Person, (person) => person.personAddress)
  person: Person;
}
