import { HttpException, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../utilities/file-upload.util';

// Define a type for the file object
interface File {
  originalname: string;
  [key: string]: any; // Allow other properties
}

// Define a type for the original method
type OriginalMethodType<T = any> = (...args: any[]) => Promise<T>;

// Custom decorator for file upload
export const FileUpload = (
  isMultiple: boolean = false,
  maxCount: number = 20,
) => {
  return (
    target: Record<string, any>,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<OriginalMethodType>,
  ) => {
    const interceptor = isMultiple
      ? FilesInterceptor('images', maxCount, {
          storage: diskStorage({
            destination: './uploads',
            filename: editFileName,
          }),
          fileFilter: imageFileFilter,
        })
      : FileInterceptor('image', {
          storage: diskStorage({
            destination: './uploads',
            filename: editFileName,
          }),
          fileFilter: imageFileFilter,
        });

    const originalMethod = descriptor.value as OriginalMethodType;

    descriptor.value = async function <T>(
      ...args: (File | File[])[]
    ): Promise<T> {
      if (isMultiple) {
        // For multiple files
        const files = args.find((arg) => Array.isArray(arg));
        if (!files || files.length === 0) {
          throw new HttpException('Images are required', 400);
        }
      } else {
        // For a single file
        const file = args.find((arg) => arg && (arg as File).originalname) as
          | File
          | undefined;
        if (!file) {
          throw new HttpException('Image is required', 400);
        }
      }

      // Call the original method and await its result
      const result: T = (await originalMethod.apply(this, args)) as T;
      return result; // Return the result with proper typing
    };

    UseInterceptors(interceptor)(target, key, descriptor);
  };
};
