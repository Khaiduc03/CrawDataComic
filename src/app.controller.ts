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
  @Get('detail')
  async detail_manga(): Promise<any> {
    return await this.appService.detail_manga();
  }

  @Get('data')
  async data_chapter(@Query('url') url: string): Promise<any> {
    console.log(url);
    return await this.appService.data_chapter(url);
  }

  @Get('search')
  async search_manga(@Query('name') name: string): Promise<any> {
    return await this.appService.data_chapter(name);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const content = await fs.readFileSync(file.buffer, 'hex');
    // const data = await JSON.parse(content);
    return content;
  }

  @Get('read')
  async readFile() {
    return await this.appService.getImagesAndPushToCloudinary();
  }
}
