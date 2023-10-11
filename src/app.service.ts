import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import { Manga, MangaType } from 'manga-lib';
import * as os from 'os';
import { CloudService } from './cloud';
import { uuids4 } from './function/uuid';
import { Comic } from './entities/comic.entity';

import {
  responseChapter,
  responseDetailManga,
} from 'manga-lib/dist/src/types/type';
import { transformString } from './function/transfromString';
import { InjectRepository } from '@nestjs/typeorm';
const path = require('path');

@Injectable()
export class AppService {
  constructor(private readonly cloud: CloudService) {}

  async getAndDownLoadImageByPage(page: number = 1): Promise<any> {
    const comics: Comic[] = [];
    const manga = new Manga().build(MangaType.TOONILY);
    const { data } = await manga.getListLatestUpdate(page);
    data.sort((a, b) => a.title.localeCompare(b.title));
    for (const item of data) {
      const folder = transformString(item.title);
      const itemDir = `data/${folder}`;
      const imageDir = `${itemDir}/avatar`;
      if (!fs.existsSync(itemDir)) {
        fs.mkdirSync(itemDir);
      }
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir);
      }

      // const detailComic = await this.getDetailManga(item.href);
      // for (const chapter of detailComic.chapters) {
      //   const imageChapter = await this.detail_chapter(chapter.url);
      //   const imageChapterDir = `${itemDir}/${imageChapter.title}`;
      //   if (!fs.existsSync(imageChapterDir)) {
      //     fs.mkdirSync(imageChapterDir);
      //   }
      //   for (const image of imageChapter.chapter_data) {
      //     await this.downloadImage2(image.src_origin, imageChapterDir);
      //   }
      // }
      const res = await this.downloadImage(item.image_thumbnail, imageDir);
      console.log(res + `+ index: ${data.indexOf(item)}`);
    }

    const arryObjectUrlComic = await this.getImagesAndPushToCloudinary();

    for (const item of data) {
      const detailComic = await this.getDetailManga(item.href);
      //how to get index
      const index = data.indexOf(item);

      const comic = new Comic({
        author: detailComic.author,
        comic_name: item.title,
        description: 'Dummy description',
        views: detailComic.follows,
        public_id: arryObjectUrlComic[index]?.public_id,
        image_url: arryObjectUrlComic[index]?.url,
      });
      comics.push(comic);
    }
    return comics;
  }

  async downloadImage(imageUrl: string, saveDir: string) {
    try {
      const USER_AGENT =
        os.platform() === 'win32'
          ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
          : 'Mozilla/5.0 (X11; Linux ppc64le; rv:75.0) Gecko/20100101 Firefox/75.0';

      const headers = {
        dnt: '1',
        'user-agent': USER_AGENT,
        'accept-language': 'en-US,en;q=0.9',
      };

      const image_headers = {
        referer: 'https://toonily.com/',
        ...headers,
      };
      const response = await axios.get(imageUrl, {
        responseType: 'stream',
        headers: image_headers,
      });
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

  async downloadImage2(imageUrl: string, saveDir: string) {
    try {
      const USER_AGENT =
        os.platform() === 'win32'
          ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
          : 'Mozilla/5.0 (X11; Linux ppc64le; rv:75.0) Gecko/20100101 Firefox/75.0';

      const headers = {
        dnt: '1',
        'user-agent': USER_AGENT,
        'accept-language': 'en-US,en;q=0.9',
      };

      const image_headers = {
        referer: 'https://toonily.com/',
        ...headers,
      };
      const response = await axios.get(imageUrl, {
        responseType: 'stream',
        headers: image_headers,
      });

      // Tạo tên tệp dựa trên số thứ tự
      const maxImageCount = 200; // Số tệp hình ảnh tối đa
      const paddedNumber = (index: number) => index.toString().padStart(3, '0'); // Định dạng số thứ tự

      let index = 1; // Bắt đầu từ tệp số 001
      let imageFileName: string;

      do {
        imageFileName = `${paddedNumber(index)}.jpg`;
        // Tạo đường dẫn đầy đủ để lưu tệp
        const imagePath = path.join(saveDir, imageFileName);

        if (!fs.existsSync(imagePath)) {
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
        }

        index++;
      } while (index <= maxImageCount);

      // Đã đạt đến số tệp tối đa
      console.error('Đã đạt đến số tệp hình ảnh tối đa.');
      return null;
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
          const jpgFilesInSubdir = files.filter((file) => file);

          jpgFiles.push(
            ...jpgFilesInSubdir.map((file) =>
              path.join(imagesDirectoryPath, file),
            ),
          );
          console.log(jpgFiles);
        } catch (error) {
          // Xử lý lỗi nếu có trong từng thư mục con
          console.error(
            `Không thể đọc tệp hình ảnh từ thư mục con ${subdirectory}: ${error.message}`,
          );
        }
      }

      console.log(jpgFiles.length);
      return {
        subdirectories,
        jpgFiles,
      };
    } catch (error) {
      // Xử lý lỗi nếu có
      throw new Error(`Không thể đọc tệp hình ảnh: ${error.message}`);
    }
  }

  async getImagesAndPushToCloudinary(): Promise<
    {
      url: string;
      public_id: string;
    }[]
  > {
    const { jpgFiles, subdirectories } =
      await this.readImagesFromDataDirectory();
    const response = await this.cloud.uploadImagesToCloudinaryV2(
      jpgFiles,
      subdirectories,
    );
    if (!response) {
      throw new Error('Upload failed');
    }

    return response;
  }

  ///////////////////////////////////////////////////////////////

  async getDetailManga(url: string): Promise<responseDetailManga> {
    const manga = new Manga().build(MangaType.TOONILY);
    const detail_manga = await manga.getDetailManga(url);
    return detail_manga;
  }

  /////////////////////////////
  async detail_chapter(url: string): Promise<responseChapter> {
    const manga = new Manga().build(MangaType.TOONILY);
    const detail_chapter: responseChapter = await manga.getDataChapter(url);
    return detail_chapter;
  }

  async readFile(files: any) {
    const file = files;
    const data = await fs.readFileSync(file.path, 'utf-8');
    return JSON.parse(data);
  }
}
