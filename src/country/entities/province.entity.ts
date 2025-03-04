import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from './country.entity';
import { PersonAddress } from 'src/person/entities/person-address.entity';

@Entity('province')
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Country, (country) => country.province)
  country: Country;

  @OneToMany(() => PersonAddress, (personAddress) => personAddress.province)
  personAddress: PersonAddress[];
}
