import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PersonModule } from './person/person.module';
import { UserModule } from './user/user.module';
import { CountryModule } from './country/country.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CuentaBancoModule } from './cuenta-banco/cuenta-banco.module';
import { SolicitudModule } from './solicitud/solicitud.module';
import { PrestamoModule } from './prestamo/prestamo.module';

console.log(join(__dirname, '..', 'upload'))
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    AuthModule,
    PersonModule,
    UserModule,
    CountryModule,
    CuentaBancoModule,
    SolicitudModule,
    PrestamoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
