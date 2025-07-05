export interface EnvironmentConfig {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    corsOrigin: string;
    allowedOrigins: string[];
    jwtSecret: string;
    redisUrl?: string;
    externalApiUrl: string;
    logLevel: string;
    rateLimit: {
        max: number;
        windowMs: number;
    };
}
export declare const getEnvironmentConfig: () => EnvironmentConfig;
export declare const config: EnvironmentConfig;
