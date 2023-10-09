import {
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import * as fs from 'fs';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('avatar')
  async getLast_Page(@Query('page', ParseIntPipe) page: number): Promise<any> {
    return await this.appService.getAndDownLoadImageByPage(page);
  }
}
