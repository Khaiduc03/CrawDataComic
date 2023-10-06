import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudModule, CloudService } from './cloud';

@Module({
  imports: [CloudModule],
  controllers: [AppController],
  providers: [AppService, CloudService],
})
export class AppModule {}
