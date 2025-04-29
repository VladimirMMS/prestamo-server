import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LoanRequest } from 'src/solicitud/entities/solicitud.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import { Loan } from './entities/prestamo.entity';
import { User } from 'src/user/entities/user.entity';
import { StatusPrestamo } from './interfaces/status.interface';
import { Frecuencia } from 'src/solicitud/interfaces/solicitud-frecuencia.interface';
import { Status } from 'src/solicitud/interfaces/solicitud-status.interface';
import { PaymentHistory } from './entities/historial.entity';
import { PaymentDto } from './dto/payment.dto';
import { Interest } from './entities/Interes.entity';
import { InteresDto } from './dto/interest.dto';
import { createWriteStream, existsSync } from 'fs';
import { join } from 'path';
import * as PDFDocument from 'pdfkit';
import { DocumentGeneric } from 'src/person/entities/documento.entity';

export interface ReceiptData {
  userName: string;
  loanId: number;
  amount: number;
  date: Date;
  remainingBalance: number;
  installmentsLeft: number;
  fileName: string;
}

@Injectable()
export class PrestamoService {
  private readonly MIN_LOANS_FOR_DISCOUNT = 3;
  private readonly DISCOUNT_FACTOR = 0.9; // 10% menos
  private readonly SURCHARGE_FACTOR = 1.1; // 10% más
  private readonly uploadDir = join(process.cwd(), 'uploads');
  constructor(
    @InjectRepository(LoanRequest)
    private readonly loanRequestRepository: Repository<LoanRequest>,

    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepository: Repository<PaymentHistory>,

    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>,

    @InjectRepository(DocumentGeneric)
    private readonly documentRepository: Repository<DocumentGeneric>,
  ) {}

  async create(loan: LoanRequest) {
    const {
      id,
      amountRequested,
      installments,
      paymentFrequency,
      interestRate,
      installmentAmount,
      user,
      termInMonths,
      totalLoanAmount,
    } = loan;

    const currentDate = new Date();
    const newLoan = this.loanRepository.create({
      status: StatusPrestamo.ACTIVO,
      approvedAmount: amountRequested,
      remainingBalance: totalLoanAmount,
      interestRate: interestRate,
      termInMonths: termInMonths,
      installments: installments,
      installmentAmount: installmentAmount,
      startDate: new Date(),
      incomingPaymentDate: this.getNextPyamentDate(
        paymentFrequency,
        currentDate,
      ),
      endDate: new Date(
        new Date().setMonth(new Date().getMonth() + termInMonths),
      ),
      user: {
        id: user.id,
      },
      loanRequest: {
        id: id,
      },
    });
    return await this.loanRepository.save(newLoan);
  }

  async findPrestamos(userId: number) {
    const prestamos = await this.loanRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: [
        'user',
        'loanRequest',
        'loanRequest.bankAccount',
        'paymentHistory',
      ],
    });

    if (!prestamos.length) return [];

    return prestamos.map((prestamo) => {
      return {
        id: prestamo.id,
        cuotas: prestamo.installmentAmount,
        balance: prestamo.remainingBalance,
        estado: prestamo.status,
        tasa: prestamo.interestRate,
        nextPay: prestamo.incomingPaymentDate,
        bankAccount: prestamo.loanRequest.bankAccount.accountNumber,
        cuotasRestantes: prestamo.installments,
        pagoAtrasado: 0,
        diasAtraso: 0,
        moraCalculada: 0,
        totalAPagar: 0,
        montoOriginal: prestamo.approvedAmount,
      };
    });
  }

  async findStatsDashboard(userId: number) {
    const result = await this.loanRequestRepository
      .createQueryBuilder('loanRequest')
      .select('loanRequest.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('loanRequest.userId = :userId', { userId })
      .groupBy('loanRequest.status')
      .getRawMany();

    const stats = {
      [Status.Pendiente]: 0,
      [Status.Aprobado]: 0,
      [Status.Rechazado]: 0,
    };

    const statsLoan = await this.getLoanStats(userId);
    result.forEach((item) => {
      stats[item.status] = Number(item.count);
    });

    return {
      stats,
      statsLoan,
      payProgress: await this.getMonthlyPaymentSummary(userId),
      weeklyPayments: await this.getWeeklyPaymentSummary(userId),
    };
  }

  async getLoanStats(userId: number): Promise<{
    nextPayment: { date: string; amount: string };
    latePayments: number;
    totalPaid: string;
  }> {
    // Valores por defecto
    const defaultResponse = {
      nextPayment: { date: 'N/A', amount: '$0.00' },
      latePayments: 0,
      totalPaid: '$0.00',
    };

    try {
      // 1. Obtener el préstamo activo del usuario
      const activeLoan = await this.loanRepository.findOne({
        where: {
          user: { id: userId },
          status: StatusPrestamo.ACTIVO,
        },
        relations: ['paymentHistory'],
      });

      if (!activeLoan) {
        return defaultResponse;
      }

      // 2. Calcular próximo pago con validación
      let nextPaymentDate = 'N/A';
      let nextPaymentAmount = '$0.00';
      if (activeLoan.incomingPaymentDate) {
        nextPaymentDate = new Date(
          activeLoan.incomingPaymentDate,
        ).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }

      if (activeLoan.installmentAmount) {
        const amount = Number(activeLoan.installmentAmount);
        nextPaymentAmount = `$${amount.toFixed(0)}`;
      }

      // 3. Calcular pagos atrasados con manejo de errores
      let latePayments = 0;
      try {
        const lateCount = await this.paymentHistoryRepository
          .createQueryBuilder('payment')
          .where('payment.loanId = :loanId', { loanId: activeLoan.id })
          .andWhere('payment.onTime = false')
          .getCount();
        latePayments = lateCount || 0;
      } catch (error) {
        console.error('Error counting late payments:', error);
        latePayments = 0;
      }

      // 4. Calcular total pagado con manejo robusto
      let totalPaid = '$0.00';
      try {
        const totalPaidResult = await this.paymentHistoryRepository
          .createQueryBuilder('payment')
          .select('SUM(payment."amountPaid")', 'total')
          .where('payment.loanId = :loanId', { loanId: activeLoan.id })
          .getRawOne();

        const total = parseFloat(totalPaidResult?.total || '0');
        totalPaid = `$${isNaN(total) ? '0.00' : total.toFixed(2)}`;
      } catch (error) {
        console.error('Error calculating total paid:', error);
        totalPaid = '$0.00';
      }

      return {
        nextPayment: {
          date: nextPaymentDate,
          amount: nextPaymentAmount,
        },
        latePayments,
        totalPaid,
      };
    } catch (error) {
      console.error('Error in getLoanStats:', error);
      return defaultResponse;
    }
  }

  private getNextPyamentDate(frecuency: Frecuencia, currentDate: Date): Date {
    const nextPaymentDate = new Date(currentDate);
    switch (frecuency) {
      case 'semanal':
        nextPaymentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'quincenal':
        nextPaymentDate.setDate(currentDate.getDate() + 15);
        break;
      case 'mensual':
        nextPaymentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        throw new Error('Invalid payment frequency');
    }

    return nextPaymentDate;
  }

  async getMonthlyPaymentSummary(userId: number) {
    const loans = await this.loanRepository.find({
      where: { user: { id: userId } },
      relations: ['paymentHistory'],
    });

    const monthlyData = new Map<string, { pagos: number; pendiente: number }>();

    for (const loan of loans) {
      for (const payment of loan.paymentHistory) {
        const monthKey = payment.paymentdate.toLocaleString('default', {
          month: 'short',
        });

        const prev = monthlyData.get(monthKey) || { pagos: 0, pendiente: 0 };
        prev.pagos += Number(payment.amountPaid);
        prev.pendiente +=
          Number(loan.remainingBalance) / loan.paymentHistory.length;

        monthlyData.set(monthKey, prev);
      }
    }
    // Convertir a array ordenado por mes
    const orderedMonths = [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ];
    const result = orderedMonths
      .filter((m) => monthlyData.has(m))
      .map((m) => ({ name: m, ...monthlyData.get(m) }));

    return result;
  }

  // Para generar los datos tipo paymentHistoryData
  async getWeeklyPaymentSummary(userId: number) {
    const payments = await this.paymentHistoryRepository.find({
      where: {
        loan: { user: { id: userId } },
      },
      relations: ['loan', 'loan.user'],
    });

    const weeksMap = new Map<string, number>();

    for (const payment of payments) {
      const date = new Date(payment.paymentdate);
      const start = new Date(date);
      start.setDate(date.getDate() - date.getDay() + 1); // lunes
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // domingo

      const label = `${start.getDate()}-${end.getDate()} ${end.toLocaleString(
        'default',
        { month: 'short' },
      )}`;
      const prevAmount = weeksMap.get(label) || 0;
      weeksMap.set(label, prevAmount + Number(payment.amountPaid));
    }

    return Array.from(weeksMap.entries()).map(([semana, monto]) => ({
      semana,
      monto,
    }));
  }

  async addPayment(payment: PaymentDto) {
    const { amount, type, loanId } = payment;

    try {
      const loan = await this.loanRepository.findOne({
        where: { id: loanId },
        relations: ['user', 'loanRequest'],
      });

      // const payDay = new Date(loan.incomingPaymentDate);
      // if (payDay.getMonth() !== new Date().getMonth()) {
      //   throw new Error('El pago no es del mes actual');
      // }

      if (amount > loan.remainingBalance) {
        throw new Error('El monto excede el balance restante del préstamo');
      }

      if (!loan) {
        throw new Error('Loan not found');
      }
      const timestamp = Date.now();
      const filename = `receipt_${loan.id}_${timestamp}.pdf`;
      const fileUrl = this.generateFileUrl(filename);

      const document = await this.documentRepository.save({
        name: 'RECIBO DE PAGO',
        route: fileUrl,
        tipo: 1,
        extension: 'pdf',
        createdAt: new Date(),
      });

      const newPayment = this.paymentHistoryRepository.create({
        amountPaid: amount,
        loan: loan, // ✅ Pasa la entidad completa
        onTime:
          type === 'CUOTA'
            ? this.isPayInTime(new Date(loan.incomingPaymentDate), new Date())
            : null,
        payType: type,
        documentId: document.id,
      });

      loan.remainingBalance -= amount;

      if (payment.type === 'CUOTA') {
        const ff = this.getNextPyamentDate(
          loan.loanRequest.paymentFrequency,
          new Date(loan.incomingPaymentDate),
        );
        loan.incomingPaymentDate = ff;

        loan.installments -= 1;
      } else if (payment.type === 'ABONO') {
        if (loan.remainingBalance <= 0) {
          throw new Error(
            'No se puede recalcular cuotas con balance restante 0',
          );
        }

        // Recalcula el número de cuotas
        loan.installments = Math.ceil(
          loan.remainingBalance / loan.loanRequest.installmentAmount,
        );

        // Ajusta el monto para que sea proporcional si quieres mantener la ecuación exacta:
        loan.installmentAmount = parseFloat(
          (loan.remainingBalance / loan.installments).toFixed(2),
        );
      }

      if (parseInt(loan.remainingBalance.toString()) <= 0) {
        loan.status = StatusPrestamo.FINALIZADO;
        loan.installments = 0;
        loan.remainingBalance = 0;
        loan.incomingPaymentDate = null;
      }

      loan.paymentHistory.push(newPayment);
      await this.loanRepository.save(loan);

      await this.generateAndSaveReceipt({
        userName: loan.user.email,
        loanId: loan.id,
        amount: amount,
        date: new Date(),
        remainingBalance: loan.remainingBalance,
        installmentsLeft: loan.installments,
        fileName: filename,
      });
      return newPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw new Error('Error al agregar el pago');
    }
  }

  isPayInTime(payDateOfficial: Date, payDay: Date) {
    const official = new Date(
      payDateOfficial.getFullYear(),
      payDateOfficial.getMonth(),
      payDateOfficial.getDate(),
    );

    const actual = new Date(
      payDay.getFullYear(),
      payDay.getMonth(),
      payDay.getDate(),
    );

    return actual.getTime() <= official.getTime();
  }

  async findHisorialPrestamo(loanId: number) {
    const historial = await this.paymentHistoryRepository.find({
      where: {
        loan: {
          id: loanId,
        },
      },
      relations: ['loan'],
      order: {
        paymentdate: 'ASC',
      },
    });
    const docsIds = historial?.map((h) => h.documentId);
    const docs = await this.documentRepository.find({
      where: {
        id: In(docsIds),
      },
    });
    console.log(docs);
    if (historial.length) {
      const historialPrestamo = historial.map((h) => {
        const documentouRL = docs.find((doc) => doc.id === h.documentId)?.route;
        return {
          fecha: h.paymentdate,
          monto: h.amountPaid,
          tipo: h.payType,
          estado: h.onTime,
          id: h.id,
          onTime: h.onTime,
          documentouRL: documentouRL,
        };
      });
      return historialPrestamo;
    }
    return [];
  }

  async obtenerNumberSolicitudes() {
    const result = await this.loanRequestRepository
      .createQueryBuilder('loanRequest')
      .select('loanRequest.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('loanRequest.status')
      .getRawMany();

    let totalPaid = '$0.00';
    try {
      const totalPaidResult = await this.paymentHistoryRepository
        .createQueryBuilder('payment')
        .select('SUM(payment."amountPaid")', 'total')
        .getRawOne();

      const total = parseFloat(totalPaidResult?.total || '0');
      totalPaid = `$${isNaN(total) ? '0.00' : total.toFixed(2)}`;
    } catch (error) {
      console.error('Error calculating total paid:', error);
      totalPaid = '$0.00';
    }

    const stats = {
      [Status.Pendiente]: 0,
      [Status.Aprobado]: 0,
      [Status.Rechazado]: 0,
    };
    result.forEach((item) => {
      stats[item.status] = Number(item.count);
    });
    const statsPyamentLoan = await this.getOverdueStats();
    return {
      ...stats,
      totalPaid,
      statsPyamentLoan,
    };
  }

  async getOverdueStats() {
    const today = new Date();
    const activeLoans = await this.loanRepository.find({
      where: {
        status: StatusPrestamo.ACTIVO,
        remainingBalance: MoreThan(0),
        incomingPaymentDate: LessThan(today),
      },
      relations: ['paymentHistory'],
    });

    const overdueLoans = activeLoans.filter(
      (loan) =>
        !loan.paymentHistory.some(
          (payment) =>
            payment.paymentdate >= loan.incomingPaymentDate &&
            payment.amountPaid >= loan.installmentAmount,
        ),
    );
    const totalOverdue = overdueLoans.length;
    const totalRemainingBalance = overdueLoans.reduce(
      (sum, loan) => sum + Number(loan.remainingBalance),
      0,
    );
    const totalMissedInstallments = overdueLoans.reduce(
      (sum, loan) => sum + Number(loan.installmentAmount),
      0,
    );

    return {
      totalOverdue,
      totalRemainingBalance,
      totalMissedInstallments,
      overdueLoans, // Opcional: detalles de cada préstamo
    };
  }

  async findPrestamosGeneral() {
    const prestamos = await this.loanRepository.find({
      relations: [
        'user',
        'loanRequest',
        'loanRequest.bankAccount',
        'paymentHistory',
      ],
    });

    if (!prestamos.length) return [];

    return prestamos.map((prestamo) => {
      return {
        id: prestamo.id,
        cuotas: prestamo.installmentAmount,
        balance: prestamo.remainingBalance,
        estado: prestamo.status,
        tasa: prestamo.interestRate,
        nextPay: prestamo.incomingPaymentDate,
        bankAccount: prestamo.loanRequest.bankAccount.accountNumber,
        cuotasRestantes: prestamo.installments,
        pagoAtrasado: 0,
        diasAtraso: 0,
        moraCalculada: 0,
        totalAPagar: 0,
        montoOriginal: prestamo.approvedAmount,
      };
    });
  }

  async findInterests() {
    return await this.interestRepository.find();
  }

  async createInterest(interesDto: InteresDto) {
    const { amount } = interesDto;

    const newInterest = this.interestRepository.create({
      amount: amount,
      date: new Date(),
      isActive: true,
      isDefault: interesDto.isDefault,
    });

    return await this.interestRepository.save(newInterest);
  }

  async findInterestByUserId(userId: number): Promise<number> {
    const baseInterest = await this.interestRepository.findOne({
      where: { isDefault: true },
    });
    if (!baseInterest) {
      throw new NotFoundException('Tasa de interés base no configurada');
    }
    const baseRate = baseInterest.amount;

    const loans = await this.loanRepository.find({
      where: { user: { id: userId } },
      relations: ['loanRequest'],
    });

    const closedLoans = loans.filter(
      (loan) => loan.status === StatusPrestamo.FINALIZADO,
    );

    if (closedLoans.length === 0) {
      return baseRate * this.SURCHARGE_FACTOR;
    }

    if (closedLoans.length >= this.MIN_LOANS_FOR_DISCOUNT) {
      return baseRate * this.DISCOUNT_FACTOR;
    }

    return baseRate;
  }

  async updateInterest(id: number, body: any) {
    const { userId, ...rest } = body;
    if (body.isDefault) {
      const interest = await this.interestRepository.findOne({
        where: {
          isDefault: true,
        },
      });
      if (interest) {
        interest.isDefault = false;
        await this.interestRepository.save(interest);
      }
    }
    return await this.interestRepository.update(id, rest);
  }

  async generateAndSaveReceipt(data: ReceiptData): Promise<string> {
    const filePath = join(this.uploadDir, data.fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = createWriteStream(filePath);
      doc.pipe(stream);

      // Cargar logo (en esquina superior derecha)
      const logoPath = join(process.cwd(), 'assets', 'vite.png');
      if (existsSync(logoPath)) {
        doc.image(logoPath, 450, 40, { width: 100 }); // Ajusta la posición del logo
      }

      // Encabezado
      doc
        .fillColor('#000')
        .fontSize(22)
        .text('Comprobante de Pago', { align: 'left' })
        .moveDown(0.5);

      doc
        .moveTo(50, 100)
        .lineTo(545, 100)
        .strokeColor('#cccccc')
        .lineWidth(1)
        .stroke();

      doc.moveDown(1.5);

      // Datos del cliente
      doc
        .fontSize(12)
        .fillColor('#444444')
        .text(`Cliente: `, { continued: true })
        .fillColor('#000')
        .text(`${data.userName}`)
        .moveDown(0.3);

      doc
        .fillColor('#444444')
        .text(`Préstamo ID: `, { continued: true })
        .fillColor('#000')
        .text(`${data.loanId}`)
        .moveDown(0.3);

      doc
        .fillColor('#444444')
        .text(`Fecha de pago: `, { continued: true })
        .fillColor('#000')
        .text(`${data.date.toLocaleDateString('es-DO')}`)
        .moveDown(1);

      // Detalle del pago
      doc
        .fontSize(13)
        .fillColor('#333333')
        .text('Detalles del Pago:', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#444444')
        .text(`Monto abonado: `, { continued: true })
        .fillColor('#000')
        .text(`RD$ ${data.amount.toFixed(2)}`)
        .moveDown(0.3);

      doc
        .fillColor('#444444')
        .text(`Balance restante: `, { continued: true })
        .fillColor('#000')
        .text(`RD$ ${data.remainingBalance.toFixed(2)}`)
        .moveDown(0.3);

      doc
        .fillColor('#444444')
        .text(`Cuotas restantes: `, { continued: true })
        .fillColor('#000')
        .text(`${data.installmentsLeft}`)
        .moveDown(2);

      // Footer
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text(
          'Gracias por su pago. Para cualquier consulta, contáctenos a vmsprestamos@gmail.com.do',
          50,
          750,
          {
            align: 'center',
            width: 500,
          },
        );

      doc.end();

      stream.on('finish', () => resolve(data.fileName));
      stream.on('error', (err) => reject(err));
    });
  }
  private generateFileUrl(filename: string): string {
    return `http://localhost:3000/uploads/${filename}`;
  }
}
