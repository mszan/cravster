import { Injectable, Logger } from "@nestjs/common";
import _ from "lodash";
import LRUCache from "lru-cache";
import { configInstance } from "../app.config";

@Injectable()
export class InMemoryCacheService {
  protected readonly logger = new Logger(InMemoryCacheService.name);

  private lruCache: LRUCache<string, unknown>;
  private defaultOptions: LRUCache.Options<string, unknown>;
  private defaultGetOptions: LRUCache.GetOptions;
  private defaultSetOptions: LRUCache.SetOptions<string, unknown>;

  public constructor() {
    this.defaultOptions = configInstance.cache.inMemory.defaultOptions;
    this.defaultGetOptions = configInstance.cache.inMemory.defaultGetOptions;
    this.defaultSetOptions = configInstance.cache.inMemory.defaultSetOptions;
    this.lruCache = new LRUCache(this.defaultOptions);
  }

  public set(key: string, value: unknown, options?: LRUCache.SetOptions<string, unknown>) {
    const optionsWithDefaults: LRUCache.SetOptions<string, unknown> = {
      ...this.defaultSetOptions,
      ...options,
    };
    this.logger.debug(
      `SET CACHE [key: ${key}, value: ${JSON.stringify(value)}, options: ${JSON.stringify(optionsWithDefaults)}]`,
    );
    this.lruCache.set(key, value, optionsWithDefaults);
  }

  public get<Value>(key: string, options?: LRUCache.GetOptions) {
    const optionsWithDefaults: LRUCache.GetOptions = {
      ...this.defaultGetOptions,
      ...options,
    };
    const cachedValue = this.lruCache.get<Value>(key, optionsWithDefaults);
    this.logger.debug(
      `GET CACHE [key: ${key}, value: ${JSON.stringify(cachedValue)}, options: ${JSON.stringify(optionsWithDefaults)}]`,
    );
    return _.cloneDeep(cachedValue);
  }
}
