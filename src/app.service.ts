import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import { Manga, MangaType } from 'manga-lib';
import { CloudService } from './cloud';
const path = require('path');
@Injectable()
export class AppService {
  constructor(private readonly cloud: CloudService) {}

  async getLast_Page(): Promise<any> {
    const manga = new Manga().build(MangaType.TOONILY);
    const { data } = await manga.getListLatestUpdate();

    const transformedList = data.map((item) => ({
      title: item.title,
      image_url: item.image_thumbnail,
    }));
    for (const item of transformedList) {
      const itemDir = `data/${item.title}`;
      const imageDir = `${itemDir}/avatar`;
      if (!fs.existsSync(itemDir)) {
        fs.mkdirSync(itemDir);
      }

      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir);
      }
      await this.downloadImage(item.image_url, imageDir);
    }
  }

  async downloadImage(imageUrl: string, saveDir: string) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'stream' });

      // Lấy tên tệp từ URL
      const imageFileName = path.basename(imageUrl);

      // Tạo đường dẫn đầy đủ để lưu tệp
      const imagePath = path.join(saveDir, imageFileName);

      const writer = fs.createWriteStream(imagePath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          resolve(imagePath);
        });

        writer.on('error', (err) => {
          reject(err);
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async readImagesFromDataDirectory(): Promise<{
    subdirectories: string[];
    jpgFiles: string[];
  }> {
    const dataDirectoryPath = path.join(__dirname, '..', 'data');

    try {
      const subdirectories = await fs.promises.readdir(dataDirectoryPath);

      const jpgFiles: string[] = [];

      for (const subdirectory of subdirectories) {
        const imagesDirectoryPath = path.join(
          dataDirectoryPath,
          subdirectory,
          'avatar',
        );
        try {
          const files = await fs.promises.readdir(imagesDirectoryPath);
          const jpgFilesInSubdir = files.filter((file) =>
            file.endsWith('.jpg'),
          );
          jpgFiles.push(
            ...jpgFilesInSubdir.map((file) =>
              path.join(imagesDirectoryPath, file),
            ),
          );
        } catch (error) {
          // Xử lý lỗi nếu có trong từng thư mục con
          console.error(
            `Không thể đọc tệp hình ảnh từ thư mục con ${subdirectory}: ${error.message}`,
          );
        }
      }

      return {
        subdirectories,
        jpgFiles,
      };
    } catch (error) {
      // Xử lý lỗi nếu có
      throw new Error(`Không thể đọc tệp hình ảnh: ${error.message}`);
    }
  }

  async getImagesAndPushToCloudinary(): Promise<any> {
    const { jpgFiles, subdirectories } = await this.readImagesFromDataDirectory();
    const response = await this.cloud.uploadImagesToCloudinaryV2(
      jpgFiles,
      subdirectories,
    );
    if (!response) {
      throw new Error('Upload failed');
    }
    return response;
  }

  async detail_manga(url: string): Promise<any> {
    const manga = new Manga().build(MangaType.MANGADEX);
    const detail_manga = await manga.getDetailManga(url);
    return detail_manga.chapters;
  }

  async data_chapter(url: string): Promise<any> {
    const manga = new Manga().build(MangaType.ASURASCANS);
    const data_chapter = await manga.getDataChapter(
      'https://asuratoon.com/3787011421-martial-god-regressed-to-level-2-chapter-29/',
    );
    console.log(data_chapter);
    return data_chapter;
  }

  async search_manga(name: string): Promise<any> {
    const manga = new Manga().build(MangaType.ASURASCANS);
    const search_manga = await manga.search(name);
    return search_manga;
  }

  async readFile(files: any) {
    const file = files;
    const data = await fs.readFileSync(file.path, 'utf-8');
    return JSON.parse(data);
  }
}
