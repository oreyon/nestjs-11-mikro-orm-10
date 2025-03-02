import { z, ZodType } from 'zod';

export class CloudinaryValidation {
  static readonly UPLOAD_IMAGE: ZodType = z.object({
    image: z
      .custom<Express.Multer.File>(
        (file: Express.Multer.File): boolean =>
          !!file?.buffer && !!file?.mimetype,
        {
          message: 'Invalid file.',
        },
      )
      .refine(
        (file: Express.Multer.File): boolean => file.size <= this.MAX_FILE_SIZE,
        {
          message: 'Max image size is 5MB.',
        },
      )
      .refine(
        (file: Express.Multer.File): boolean =>
          this.ACCEPTED_IMAGE_TYPES.includes(file.mimetype),
        {
          message: 'Only .jpg, .jpeg, .png and .webp formats are supported.',
        },
      ),
  });

  private static MAX_FILE_SIZE: number = 5000000;
  private static ACCEPTED_IMAGE_TYPES: string[] = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
}
