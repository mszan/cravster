import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import _ from "lodash";
import { UploadedObjectInfo } from "minio";
import { MinioService } from "nestjs-minio-client";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { BucketKey, configInstance } from "../app.config";

export type UploadedFileInfo = {
  object: UploadedObjectInfo;
  path: string;
  filename: string;
};

@Injectable()
export class StorageService implements OnModuleInit {
  protected readonly logger = new Logger(StorageService.name);

  @Inject()
  private readonly minioService: MinioService;

  async onModuleInit() {
    for (const bucketToCreate of _.values(configInstance.storage.buckets)) {
      if (!(await this.minioService.client.bucketExists(bucketToCreate.name))) {
        this.logger.log(`Bucket '${bucketToCreate.name}' DOES NOT exist. Creating it now.`);
        await this.minioService.client.makeBucket(bucketToCreate.name, bucketToCreate.region);
      } else {
        this.logger.log(`Bucket '${bucketToCreate.name}' already exist, skipping its creation.`);
      }

      // todo: set bucket policy only if needed (use getBucketPolicy and compare)
      if (bucketToCreate.policy) {
        this.logger.log(`Bucket '${bucketToCreate.name}' has defined custom policy. Setting it now.`);
        await this.minioService.client.setBucketPolicy(bucketToCreate.name, bucketToCreate.policy);
      }
    }
  }

  private getFileExtension(file: Express.Multer.File) {
    return file.originalname.split(".").slice(-1)[0];
  }

  public async uploadPhoto(file: Express.Multer.File, bucketKey: BucketKey): Promise<UploadedFileInfo> {
    this.logger.log(`Uploading photo...`);
    const filename = `${uuidv4()}.${this.getFileExtension(file)}`;

    // full size
    this.logger.log(`> Uploading FULL photo size...`);
    const uploadedObjectInfo = await this.minioService.client.putObject(
      configInstance.storage.buckets[bucketKey].name,
      filename,
      file.buffer,
      {
        "Content-Type": "image/jpeg",
      },
    );
    this.logger.log(`> Uploading FULL photo size: DONE.`);

    // resized - w 2000, h auto
    this.logger.log(`> Uploading w2000 photo size...`);
    await this.minioService.client.putObject(
      configInstance.storage.buckets["photos"].name,
      "w2000_" + filename,
      await sharp(file.buffer).toFormat("webp").resize(2000).toBuffer(),
      {
        "Content-Type": "image/webp",
      },
    );
    this.logger.log(`> Uploading w2000 photo size: DONE.`);

    // resized - w 1000, h auto
    this.logger.log(`> Uploading w1000 photo size...`);
    await this.minioService.client.putObject(
      configInstance.storage.buckets["photos"].name,
      "w1000_" + filename,
      await sharp(file.buffer).toFormat("webp").resize(1000).toBuffer(),
      {
        "Content-Type": "image/webp",
      },
    );
    this.logger.log(`> Uploading w1000 photo size: DONE.`);

    // resized - w 500, h auto
    this.logger.log(`> Uploading w500 photo size...`);
    await this.minioService.client.putObject(
      configInstance.storage.buckets["photos"].name,
      "w500_" + filename,
      await sharp(file.buffer).toFormat("webp").resize(500).toBuffer(),
      {
        "Content-Type": "image/webp",
      },
    );
    this.logger.log(`> Uploading w500 photo size: DONE.`);

    // resized - w 100, h auto
    this.logger.log(`> Uploading w100 photo size...`);
    await this.minioService.client.putObject(
      configInstance.storage.buckets["photos"].name,
      "w100_" + filename,
      await sharp(file.buffer).toFormat("webp").resize(100).toBuffer(),
      {
        "Content-Type": "image/webp",
      },
    );
    this.logger.log(`> Uploading w100 photo size: DONE.`);

    this.logger.log(`Uploading photo: DONE.`);

    return {
      object: uploadedObjectInfo,
      path: `/${filename}`,
      filename: filename,
    };
  }
  public async getFilesListInBucket(bucketKey: BucketKey): Promise<string[]> {
    const filesList: string[] = [];
    const objectsStream = this.minioService.client.listObjects(configInstance.storage.buckets[bucketKey].name);

    return await new Promise(
      (resolve, reject) =>
        objectsStream
          .on("data", obj => {
            filesList.push(obj.name);
          })
          .on("end", () => resolve(filesList))
          // resolve is a function that you call when the work is done
          .on("error", () => reject),
      // reject is the function you call when the task fails
    );
  }

  public async uploadPhotos(files: Array<Express.Multer.File>, bucketKey: BucketKey): Promise<Array<UploadedFileInfo>> {
    const res: Array<UploadedFileInfo> = [];
    for (const file of files) {
      res.push(await this.uploadPhoto(file, bucketKey));
    }
    return res;
  }

  public async deletePhoto(filename: string, bucketKey: BucketKey): Promise<void> {
    // full size
    await this.minioService.client.removeObject(configInstance.storage.buckets[bucketKey].name, filename);

    // other sizes
    await this.minioService.client.removeObject(configInstance.storage.buckets[bucketKey].name, "w2000_" + filename);
    await this.minioService.client.removeObject(configInstance.storage.buckets[bucketKey].name, "w1000_" + filename);
    await this.minioService.client.removeObject(configInstance.storage.buckets[bucketKey].name, "w500_" + filename);
    await this.minioService.client.removeObject(configInstance.storage.buckets[bucketKey].name, "w100_" + filename);
  }

  public async deletePhotos(filenames: Array<string>, bucketKey: BucketKey): Promise<void> {
    for (const filename of filenames) {
      await this.deletePhoto(filename, bucketKey);
    }
  }
}
