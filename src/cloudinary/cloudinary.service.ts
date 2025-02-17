import { Injectable } from '@nestjs/common';
import { Cloudinary } from './cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly cloudinary: Cloudinary) {}

  async uploadSingle(file: Express.Multer.File): Promise<UploadApiResponse> {
    const cloudinaryInstance = this.cloudinary.getInstance();
    const fileDataUrl: string = this.bufferFileToBase64(file);

    return await cloudinaryInstance.uploader.upload(fileDataUrl, {
      resource_type: 'auto',
    });
  }

  async uploadMultiple(
    files: Express.Multer.File[],
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map((file) => this.uploadSingle(file));
    return Promise.all(uploadPromises);
  }

  async remove(fileUrl: string): Promise<any> {
    const cloudinaryInstance = this.cloudinary.getInstance();
    const publicId = this.getPublicIdFromFileUrl(fileUrl);

    return (await cloudinaryInstance.uploader.destroy(
      publicId,
    )) as Promise<any>;
  }

  private bufferFileToBase64(file: Express.Multer.File): string {
    const stringBase64 = Buffer.from(file.buffer).toString('base64');
    return `data:${file.mimetype};base64,${stringBase64}`;
  }

  private getPublicIdFromFileUrl(fileUrl: string): string {
    const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    return fileName.substring(0, fileName.lastIndexOf('.'));
  }
}
