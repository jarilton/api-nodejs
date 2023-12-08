"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
if (process.env.NODE_ENV === 'test') {
    (0, dotenv_1.config)({ path: '.env.test' });
}
else {
    (0, dotenv_1.config)();
}
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('production'),
    DATABASE_URL: zod_1.z.string(),
    PORT: zod_1.z.number().default(3333),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.log('Invalid environment variables', _env.error.format());
    throw new Error('Invalid environment variables');
}
exports.env = _env.data;
