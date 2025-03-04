import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { Environment } from './enums/enviroment.enum';

export const DatabaseProviders: DynamicModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  async useFactory(config: ConfigService) {
    const isDevelopment = config.get('NODE_ENV') !== Environment.Production;
    const dbConfig = {
      type: 'postgres',
      host: config.get('DB_HOST'),
      port: +config.get('DB_PORT'),
      username: config.get('DB_USERNAME'),
      password: config.get('DB_PASSWORD'),
      database: config.get('DB_NAME'),
      synchronize: true,
      autoLoadEntities: isDevelopment,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      migrations: [join(__dirname + 'src/database/migrations/*{.ts,.js}')],
      schema: 'dev',
    } as TypeOrmModuleOptions;
    return dbConfig;
  },
});
