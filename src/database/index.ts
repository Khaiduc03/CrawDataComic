import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmService implements TypeOrmOptionsFactory {
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: '127.0.0.1',
      port: 5435,
      username: 'postgres',
      password: 'postgres',
      database: 'crawl',
      autoLoadEntities: true, // auto add new entities
      synchronize: true,
      entities: [__dirname + '/*.entity{.ts,.js}'],
      // ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
}
