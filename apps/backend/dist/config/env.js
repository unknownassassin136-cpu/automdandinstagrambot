"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().min(1).max(65535).default(3000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    // JWT
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    // Database (Supabase PostgreSQL — used by Drizzle)
    DATABASE_URL: zod_1.z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
    SUPABASE_URL: zod_1.z.string().url('SUPABASE_URL must be a valid URL'),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
    // Redis
    REDIS_URL: zod_1.z.string().min(1, 'REDIS_URL is required'),
    // Meta
    META_APP_ID: zod_1.z.string().min(1, 'META_APP_ID is required'),
    META_APP_SECRET: zod_1.z.string().min(1, 'META_APP_SECRET is required'),
    META_VERIFY_TOKEN: zod_1.z.string().min(1, 'META_VERIFY_TOKEN is required'),
    // Encryption
    ENCRYPTION_KEY: zod_1.z.string().min(32, 'ENCRYPTION_KEY must be at least 32 bytes'),
    // Ngrok
    NGROK_AUTHTOKEN: zod_1.z.string().optional(),
    NGROK_DOMAIN: zod_1.z.string().optional(),
    // Google OAuth
    GOOGLE_CLIENT_ID: zod_1.z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
    // Email
    RESEND_API_KEY: zod_1.z.string().startsWith('re_', 'RESEND_API_KEY must start with re_'),
    EMAIL_FROM: zod_1.z.string().email('EMAIL_FROM must be a valid email').default('noreply@yourdomain.com'),
    // URLs
    FRONTEND_URL: zod_1.z.string().url('FRONTEND_URL must be a valid URL'),
    BACKEND_URL: zod_1.z.string().url('BACKEND_URL must be a valid URL'),
});
function validateEnv() {
    // If we are running drizzle-kit or just importing this in a build step,
    // we might want to bypass strict validation or provide dummy values.
    // But per spec, it must fail fast.
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('✗ Invalid environment variables:');
        result.error.issues.forEach((issue) => {
            console.error(`  ✗ ${issue.path.join('.')}: ${issue.message}`);
        });
        process.exit(1); // FAIL FAST — never start with bad config
    }
    return result.data;
}
// Load .env explicitly if needed, but typically handled by dotenv/ts-node
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.env = validateEnv();
