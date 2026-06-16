"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.verifyStorage = verifyStorage;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
// We use the Supabase client primarily for Storage in the new architecture.
// Database queries are handled by Drizzle ORM.
exports.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
async function verifyStorage() {
    // Simple check to ensure we can list buckets or connect to Supabase
    const { data, error } = await exports.supabase.storage.listBuckets();
    if (error) {
        throw new Error(`Storage connection failed: ${error.message}`);
    }
    return data;
}
