import { Module } from '@nestjs/common';
import { CloudProvider } from './cloud.provider';
import { CloudService } from './cloud.service';

@Module({
  exports: [CloudProvider, CloudService],
  providers: [CloudProvider, CloudService],
})
export class CloudModule {}
