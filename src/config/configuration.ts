

export default () => ({
    nodeEnv: process.env.NODE_ENV!,
    databaseUrl: process.env.DATABASE_URL!,
    // geminiApiKey: process.env.GEMINI_API_KEY!,
    redisUrl: process.env.REDIS_URL!,
    logLevel: process.env.LOG_LEVEL?.split(',').map((l) => l.trim()) || [
    'log',
    'warn',
    'error',
  ],
});