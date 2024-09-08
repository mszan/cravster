import { MikroORM } from "@mikro-orm/core";
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { PhotoEntity } from "../../../schema/entities/photo.entity";
import { ORM } from "../../orm/orm.module";
import { InMemoryCacheService } from "./in-memory-cache.service";
import { StorageService } from "./storage.service";

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  @Inject(ORM)
  private readonly orm: MikroORM;

  @Inject()
  private readonly storageService: StorageService;

  @Inject()
  private readonly schedulerRegistry: SchedulerRegistry;

  @Inject()
  private readonly inMemoryCacheService: InMemoryCacheService;

  async onModuleInit() {
    await this.setupCronJobs();
  }

  private async createDeleteUnusedPhotosFromStorageCronJob() {
    const cronJobName = `delete_unused_photos_from_storage`;

    const cronString = "0 4 * * 0";
    // const cronString = "10,20,30,40,50,00 * * * * *"; // dev - every 10 sec
    const job = new CronJob(cronString, async () => {
      this.logger.log(`Running cron job ${cronJobName} (${cronString})...`);
      const jobStartDate = Date.now();

      const filesList = await this.storageService.getFilesListInBucket("photos");
      const photosInUse: PhotoEntity[] = await this.orm.em.fork().find(PhotoEntity, {}, { fields: ["filename"] });
      const photosInUseFilenames: string[] = photosInUse.map(p => p.filename);
      const photosInUseAllSizeFilenames: string[] = [
        ...photosInUseFilenames,
        ...photosInUseFilenames.map(p => `w2000_${p}`),
        ...photosInUseFilenames.map(p => `w1000_${p}`),
        ...photosInUseFilenames.map(p => `w500_${p}`),
        ...photosInUseFilenames.map(p => `w100_${p}`),
      ];
      const photosToRemove = filesList.filter(value => !photosInUseAllSizeFilenames.includes(value));
      await this.storageService.deletePhotos(photosToRemove, "photos");

      this.logger.log({
        msg: `Running cron job ${cronJobName} (${cronString}): DONE`,
        filesListLength: filesList.length,
        photosInUseFilenamesLength: photosInUseFilenames.length,
        photosInUseAllSizeFilenamesLength: photosInUseAllSizeFilenames.length,
        photosToRemoveLength: photosToRemove.length,
        jobDuration: Date.now() - jobStartDate,
      });
    });

    this.schedulerRegistry.addCronJob(cronJobName, job);
    job.start();

    this.logger.log(`Added cron job ${cronJobName} (${cronString})`);
  }

  private async createDeleteUnusedPhotosFromDbCronJob() {
    const cronJobName = `delete_unused_photos_from_db`;

    const cronString = "0 5 * * 0";
    const job = new CronJob(cronString, async () => {
      this.logger.log(`Running cron job ${cronJobName} (${cronString})...`);
      const jobStartDate = Date.now();
      const em = this.orm.em.fork();

      const photosToRemove = await em.find(
        PhotoEntity,
        {
          $and: [
            {
              recipe: { $not: null },
            },
          ],
        },
        { fields: ["id"] },
      );
      em.removeAndFlush(photosToRemove);

      this.logger.log({
        msg: `Running cron job ${cronJobName} (${cronString}): DONE`,
        photosToRemoveLength: photosToRemove.length,
        jobDuration: Date.now() - jobStartDate,
      });
    });

    this.schedulerRegistry.addCronJob(cronJobName, job);
    job.start();

    this.logger.log(`Added cron job ${cronJobName} (${cronString})`);
  }

  private async setupCronJobs() {
    await this.createDeleteUnusedPhotosFromStorageCronJob();
    await this.createDeleteUnusedPhotosFromDbCronJob();
  }
}
