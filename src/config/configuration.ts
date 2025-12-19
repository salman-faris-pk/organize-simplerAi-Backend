

export default () => ({
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    geminiApiKey: process.env.GEMINI_API_KEY,
});