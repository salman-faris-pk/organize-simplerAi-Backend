import { Provider } from "@nestjs/common";
import { Redis } from "ioredis";
import { ConfigService } from "@nestjs/config"


export const redisProvider: Provider = {
  provide: "REDIS_CLIENT",
  inject:[ConfigService],
  useFactory: (configService: ConfigService) => {
    const redisUrl = configService.get<string>("redisUrl");
    
    if (!redisUrl) {
      throw new Error("REDIS_URL is not defined in environment variables");
    };
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });
    
    redis.once("ready", () => console.log("Redis connected"));
    redis.on("error", (err) => console.error("Redis error:", err));

    return redis;
  },
};
