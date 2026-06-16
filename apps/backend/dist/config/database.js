"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.verifyStorage = verifyStorage;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
const ws_1 = __importDefault(require("ws"));
// We use the Supabase client primarily for Storage in the new architecture.
// Database queries are handled by Drizzle ORM.
exports.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false,
    },
    global: {
        headers: { 'x-my-custom-header': 'automd' },
    },
    realtime: {
        transport: ws_1.default,
    }
});
async function verifyStorage() {
    // Simple check to ensure we can list buckets or connect to Supabase
    const { data, error } = await exports.supabase.storage.listBuckets();
    if (error) {
        throw new Error(`Storage connection failed: ${error.message}`);
    }
    return data;
}
