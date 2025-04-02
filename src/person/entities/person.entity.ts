import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PersonDocumento } from './person-documento.entity';
import { User } from 'src/user/entities/user.entity';
import { PersonAddress } from './person-address.entity';

@Entity('person')
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  names: string;

  @Column()
  lastNames: string;

  @Column({ unique: true })
  cedula: string;

  @Column()
  fechaNacimiento: Date;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @OneToMany(() => PersonDocumento, (personDocument) => personDocument.person)
  personDocument: PersonDocumento[];

  @OneToOne(() => User, (user) => user.person)
  user?: User;

  @OneToOne(() => PersonAddress, (personAddress) => personAddress.person)
  @JoinColumn({ referencedColumnName: 'id', name: 'personAddressId' })
  personAddress: PersonAddress;
}
