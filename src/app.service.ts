import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import { Manga, MangaType } from 'manga-lib';
import { CloudService } from './cloud';
import { config } from 'process';
import * as os from 'os';
const path = require('path');

@Injectable()
export class AppService {
  constructor(private readonly cloud: CloudService) {}

  async getAndDownLoadImageByPage(page: number = 1): Promise<any> {
    const manga = new Manga().build(MangaType.TOONILY);
    const { data } = await manga.getListLatestUpdate(page);

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

    const response = await this.getImagesAndPushToCloudinary();
    return response;
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
        referer: 'https://www.nettruyenus.com/',
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


  
async  downloadImage2(imageUrl: string, saveDir: string) {
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
      referer: 'https://www.nettruyenus.com/',
      ...headers,
    };
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      headers: image_headers,
    });

    // Tạo tên tệp dựa trên thời gian hiện tại và một số duy nhất
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const imageFileName = `${timestamp}_${random}.jpg`; // Đặt định dạng tên tệp tùy ý

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

  async detail_manga(): Promise<any> {
    const dataImages = [];
    const manga = new Manga().build(MangaType.NETTRUYEN, {
      baseUrl: 'https://www.nettruyenus.com/',
    });
    const { data } = await manga.getListLatestUpdate();
    // for(const item of data){
    //   const detail_manga = await manga.getDetailManga(item.href);
    // }

    const detail_manga = await manga.getDetailManga(data[0].href);
    // for (const data_chapter of detail_manga.chapters) {
    //   const dataImage = await manga.getDataChapter(data_chapter.url);
    //   dataImages.push({
    //     chapterName: dataImage.title,
    //     images: dataImage.chapter_data,
    //   });
    // }
    // return Promise.all(dataImages);

    const { chapter_data, url } = await manga.getDataChapter(
      detail_manga.chapters[0].url,
    );

    for (const item of chapter_data) {
      const itemDir = `data`;
      const imageDir = `${itemDir}/chapter`;
      if (!fs.existsSync(itemDir)) {
        fs.mkdirSync(itemDir);
      }

      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir);
      }
      await this.downloadImage2(item.src_origin, imageDir);
    }
    return chapter_data;
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
