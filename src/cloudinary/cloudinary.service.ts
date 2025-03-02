import { Inject, Injectable } from '@nestjs/common';
import { Cloudinary } from './cloudinary';
import { UploadApiResponse } from 'cloudinary';
import { User } from '../auth/entities/user.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ValidationService } from '../common/validation/validation.service';
import { EntityManager } from '@mikro-orm/mysql';
import { UserRepository } from '../auth/user.repository';
import { CloudinaryValidation } from './cloudinary.validation';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly cloudinary: Cloudinary,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly validationService: ValidationService,
    private em: EntityManager,
    private userRepository: UserRepository,
  ) {}

  async uploadSingle(file: Express.Multer.File): Promise<UploadApiResponse> {
    this.validationService.validate(CloudinaryValidation.UPLOAD_IMAGE, {
      image: file,
    });

    const cloudinaryInstance = this.cloudinary.getInstance();
    const fileDataUrl: string = this.bufferFileToBase64(file);

    return await cloudinaryInstance.uploader.upload(fileDataUrl, {
      resource_type: 'auto',
    });
  }

  async uploadMultiple(
    files: Express.Multer.File[],
  ): Promise<UploadApiResponse[]> {
    const uploadPromises: Promise<UploadApiResponse>[] = files.map((file) =>
      this.uploadSingle(file),
    );
    return Promise.all(uploadPromises);
  }

  async remove(fileUrl: string): Promise<UploadApiResponse> {
    const cloudinaryInstance = this.cloudinary.getInstance();
    const publicId: string = this.getPublicIdFromFileUrl(fileUrl);

    return (await cloudinaryInstance.uploader.destroy(
      publicId,
    )) as UploadApiResponse;
  }

  async uploadImage(user: User, file: Express.Multer.File) {
    this.logger.debug(`FILE SIZE: ${file.size}`);
    this.logger.debug(`FILE MIME TYPE: ${file.mimetype}`);

    const fileDataUrl: string = this.bufferFileToBase64(file);
    const cloudinaryInstance = this.cloudinary.getInstance();
    const uploadResponse = await cloudinaryInstance.uploader.upload(
      fileDataUrl,
      {
        resource_type: 'auto',
      },
    );

    return uploadResponse.secure_url;
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
