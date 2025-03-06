import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Put,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../common/guards';
import { UploadApiResponse } from 'cloudinary';
import { WebResponse } from '../model/web.model';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, User } from '../auth/entities/user.entity';
import { RemoveMediaRequest } from './dto/media.dto';
import { FileUpload, UserData } from '../common/decorators';
import { Response } from 'express';
import { join } from 'path';
import { promises as fs } from 'fs';

@ApiTags('Media')
@Controller('media')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @ApiOperation({ summary: 'Upload image to cloud storage' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Put('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<WebResponse<UploadApiResponse>> {
    const result: UploadApiResponse =
      await this.cloudinaryService.uploadSingle(file);

    return {
      message: 'Upload image success',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Upload multiple images to cloud storage' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Put('upload-multiple')
  @UseInterceptors(FilesInterceptor('images', 2))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<WebResponse<UploadApiResponse[]>> {
    const result: UploadApiResponse[] =
      await this.cloudinaryService.uploadMultiple(files);

    return {
      message: 'Upload images success',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Remove image from cloud storage' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Delete('remove')
  async removeImage(
    @Body() request: RemoveMediaRequest,
  ): Promise<WebResponse<UploadApiResponse>> {
    const result: UploadApiResponse = await this.cloudinaryService.remove(
      request.secureUrl,
    );

    return {
      message: 'Remove image success',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Upload image to local server' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Put('upload-local')
  @FileUpload()
  // eslint-disable-next-line @typescript-eslint/require-await
  async uploadLocal(
    @UserData() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = {
      imageName: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      imageUrl: `${process.env.IP_BACKEND_ORIGIN}/api/v1/auth/${file.filename}`,
      createdAt: new Date(),
    };

    return {
      message: 'Upload image to local success',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Upload multiple image to local server' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Put('upload-multiple-local')
  @FileUpload(true)
  // eslint-disable-next-line @typescript-eslint/require-await
  async uploadMultipleLocal(
    @UserData() user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const result = files.map((file) => ({
      imageName: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      imageUrl: `${process.env.IP_BACKEND_ORIGIN}/api/v1/auth/${file.filename}`,
      createdAt: new Date(),
    }));

    return {
      message: 'Upload image to local success',
      data: result,
    };
  }

  @Get(':imageName')
  viewLocalImage(@Param('imageName') imageName: string, @Res() res: Response) {
    return res.sendFile(imageName, { root: 'uploads' });
  }

  @ApiOperation({ summary: 'Remove image from local server' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @Delete(':imageName')
  // eslint-disable-next-line @typescript-eslint/require-await
  async deleteLocalImage(
    @Param('imageName') imageName: string,
    @Res() res: Response,
  ) {
    const filePath = join(__dirname, '../../uploads', imageName);

    try {
      await fs.unlink(filePath); // Attempt to delete the file
      return res.status(204).send(); // Success, return 204 No Content
    } catch (error) {
      // if (error.code === 'ENOENT') {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File not found
        throw new HttpException('File not found', 404);
      }
      // Other errors (e.g., permission issues)
      throw new HttpException('File deletion failed', 500);
    }
  }
}
