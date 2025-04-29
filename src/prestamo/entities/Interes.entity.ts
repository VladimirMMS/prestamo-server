import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('interest')
export class Interest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'boolean' })
  isActive: boolean;

  @Column({ type: 'boolean' })
  isDefault: boolean;
}
