import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccount } from './entities/cuenta-banco.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateBankAccountDto } from './dto/create-cuenta-banco.dto';
import { UpdateBankAccountDto } from './dto/update-cuenta-banco.dto';

@Injectable()
export class CuentaBancoService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepo: Repository<BankAccount>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateBankAccountDto): Promise<BankAccount> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const bankAccount = this.bankAccountRepo.create({ ...dto, user });
    return this.bankAccountRepo.save(bankAccount);
  }

  async findAll(): Promise<BankAccount[]> {
    return this.bankAccountRepo.find({ relations: ['user'] });
  }

  async findByUser(id: number): Promise<BankAccount[]> {
    if (!id) {
      return [];
    }
    const account = await this.bankAccountRepo.find({
      where: {
        isDeleted: false,
        user: {
          id: id,
        },
      },
      relations: ['user'],
    });

    if (!account) throw new NotFoundException('Bank account not found');
    return account;
  }

  async update(id: number, dto: UpdateBankAccountDto): Promise<BankAccount> {
    const account = await this.findOne(id);
    Object.assign(account, dto);
    return this.bankAccountRepo.save(account);
  }

  async remove(id: number): Promise<void> {
    const account = await this.findOne(id);
    if (!account) throw new NotFoundException('Bank account not found');

    account.isDeleted = true;
    await this.bankAccountRepo.save(account);
  }

  async findOne(id: number): Promise<BankAccount> {
    const account = await this.bankAccountRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!account) throw new NotFoundException('Bank account not found');
    return account;
  }
}
