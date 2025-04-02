import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { LoanRequest } from './solicitud.entity';

@Entity('motivosRechazo')
export class MotivosRechazo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => LoanRequest, (solicitud) => solicitud.motivos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  solicitud: LoanRequest;
}
