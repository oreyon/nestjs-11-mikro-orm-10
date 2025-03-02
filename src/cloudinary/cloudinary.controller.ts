import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Put,
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
import { Role } from '../auth/entities/user.entity';
import { RemoveMediaRequest } from './dto/media.dto';

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
}
