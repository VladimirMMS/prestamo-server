import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Province } from 'src/country/entities/province.entity';

@Entity('personAddress')
export class PersonAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @ManyToOne(() => Province, (province) => province.personAddress)
  province: Province;
}
