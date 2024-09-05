import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import path from "path";
import { FileExtensionInvalidException } from "../errors/errors";

export const multerOptionsForPhoto: MulterOptions = {
  fileFilter: function (_req, file, callback) {
    const allowedExtensionsRegExp = /\.(jpe?g|png|bmp|webp)$/i;
    const fileExtension = path.extname(file.originalname);
    const isFileExtensionOk = allowedExtensionsRegExp.test(fileExtension);

    if (!isFileExtensionOk) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return callback(new FileExtensionInvalidException() as any, false);
    }
    return callback(null, true);
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
    // fields: 10,
  },
};
