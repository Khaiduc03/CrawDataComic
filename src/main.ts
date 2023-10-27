import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
const os = require('os');
dotenv.config();
process.env.UV_THREADPOOL_SIZE = os.cpus().length;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3002);
}
bootstrap();
