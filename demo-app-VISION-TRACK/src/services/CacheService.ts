export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export class CacheService {
  private static instance: CacheService;
  private localCache: Map<string, { data: any; expiry: number; metadata: any }>;
  private maxLocalCacheSize: number;

  private constructor() {
    this.localCache = new Map();
    this.maxLocalCacheSize = 1000;
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const localItem = this.localCache.get(key);
    if (localItem && localItem.expiry > Date.now()) {
      return localItem.data;
    }
    return null;
  }

  async set(key: string, data: any, ttlSeconds: number = 3600, options: CacheOptions = {}): Promise<void> {
    if (this.localCache.size >= this.maxLocalCacheSize) {
      this.evictLeastUsed();
    }
    
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.localCache.set(key, {
      data,
      expiry,
      metadata: { ...options, lastAccessed: Date.now() }
    });
  }

  private evictLeastUsed(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Date.now();
    
    for (const [key, value] of this.localCache.entries()) {
      if (value.metadata.lastAccessed < oldestAccess) {
        oldestAccess = value.metadata.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.localCache.delete(oldestKey);
    }
  }
}
