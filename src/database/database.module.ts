import { Module } from '@nestjs/common';
import { DatabaseProviders } from './database.service';

@Module({
  providers: [],
  imports: [DatabaseProviders],
  exports: [DatabaseProviders],
})
export class DatabaseModule {}
