import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudModule, CloudService } from './cloud';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmService } from './database';
import { ComicModule } from './modules/comic/comic.module';

@Module({
  imports: [
    CloudModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmService,
    }),
    ComicModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudService],
})
export class AppModule {}
