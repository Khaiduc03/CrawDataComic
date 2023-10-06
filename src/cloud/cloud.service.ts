import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
@Injectable()
export class CloudService {
  async uploadFileImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          folder,
          use_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }

  //upload multiple image
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadApiResponse[] | UploadApiErrorResponse> {
    const uploadPromises: Promise<UploadApiResponse>[] = [];

    for (const file of files) {
      const uploadPromise = new Promise<UploadApiResponse>(
        (resolve, reject) => {
          const upload = v2.uploader.upload_stream(
            {
              folder,
              use_filename: true,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          toStream(file.buffer).pipe(upload);
        },
      );
      uploadPromises.push(uploadPromise);
    }

    return Promise.all(uploadPromises);
  }

  async deleteFileImage(
    publicId: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return await v2.api.delete_resources([publicId]);
  }

  async uploadFileAvatar(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          folder,
          use_filename: true,
          exif: true,
          invalidate: true,
          unique_filename: true,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }

  async uploadImagesToCloudinary(
    imagePaths: string[],
    folder: string,
  ): Promise<UploadApiResponse[] | UploadApiErrorResponse> {
    const uploadPromises: Promise<UploadApiResponse>[] = [];

    for (const imagePath of imagePaths) {
      const uploadPromise = new Promise<UploadApiResponse>(
        (resolve, reject) => {
          const upload = v2.uploader.upload(
            imagePath,
            {
              folder,
              use_filename: true,
              tags: folder,
            },
            (error, result) => {
              if (error) {
                console.error(
                  `Lỗi khi tải lên Cloudinary cho tệp ${imagePath}: ${error.message}`,
                );
                reject(error);
              } else {
                resolve(result);
              }
            },
          );
        },
      );

      uploadPromises.push(uploadPromise);
    }

    return Promise.all(uploadPromises);
  }

  async uploadImagesToCloudinaryV2(
    imagePaths: string[],
    folders: string[],
  ): Promise<UploadApiResponse[] | UploadApiErrorResponse> {
    const uploadPromises: Promise<UploadApiResponse>[] = [];

    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      const folder = folders[i];

      const uploadPromise = new Promise<UploadApiResponse>(
        (resolve, reject) => {
          const upload = v2.uploader.upload(
            imagePath,
            {
              folder: `${folder}/avatar`,
              use_filename: true,
              tags: 'avatar',
            },
            (error, result) => {
              if (error) {
                console.error(
                  `Lỗi khi tải lên Cloudinary cho tệp ${imagePath}: ${error.message}`,
                );
                reject(error);
              } else {
                resolve(result);
              }
            },
          );
        },
      );

      uploadPromises.push(uploadPromise);
    }

    try {
      // Sử dụng Promise.all để đợi tất cả các yêu cầu tải lên hoàn thành
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      // Xử lý lỗi nếu có
      return error;
    }
  }

  async getAllImageOnFolder(tag: string): Promise<any> {
    try {
      const response = await v2.api.resources_by_tag(tag, {
        max_results: 500,
      });

      const responseURL = response.resources.map((image) => {
        return {
          public_id: image.public_id,
          url: image.url,
          secure_url: image.secure_url,
        };
      });

      responseURL.sort((a, b) => {
        if (a.public_id < b.public_id) {
          return -1;
        }
        if (a.public_id > b.public_id) {
          return 1;
        }
        return 0;
      });

      return responseURL;
    } catch (error) {
      console.log('Something went wrong: Service: getAllImageOnFolder' + error);
      throw error;
    }
  }

  async uploadMultipleByTag(
    files: Express.Multer.File[],
    folder: string[],
    tag: string,
  ): Promise<UploadApiResponse[] | UploadApiErrorResponse> {
    const uploadPromises: Promise<UploadApiResponse>[] = [];

    for (const file of files) {
      const uploadPromise = new Promise<UploadApiResponse>(
        (resolve, reject) => {
          const upload = v2.uploader.add_tag(
            tag,
            folder,
            {
              type: 'upload',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          toStream(file.buffer).pipe(upload);
        },
      );
      uploadPromises.push(uploadPromise);
    }

    return Promise.all(uploadPromises);
  }
}
