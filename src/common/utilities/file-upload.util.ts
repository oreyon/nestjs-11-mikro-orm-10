import { extname } from 'path';
import { HttpException } from '@nestjs/common';

export const imageFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new HttpException('File should be image type', 400), false);
  }
  callback(null, true);
};

export const editFileName = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  const fileExtName = extname(file.originalname); // File extension (e.g., .jpg)
  const randomName = Array(8)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16)) // Random name generator
    .join('');

  const timestamp = Date.now(); // Example of timestamp-based unique naming
  const newFileName = `${timestamp}-${randomName}${fileExtName}`;
  callback(null, newFileName);
};
