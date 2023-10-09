import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from 'src/entities/comic.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Comic])],
  
  })
export class ComicModule {}
