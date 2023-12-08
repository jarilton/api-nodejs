"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsRoutes = void 0;
const zod_1 = require("zod");
const database_1 = require("./../database");
const crypto_1 = require("crypto");
const check_session_id_exists_1 = require("../middlewares/check-session-id-exists");
async function transactionsRoutes(app) {
    app.get('/', {
        preHandler: [check_session_id_exists_1.checkSessionIdExists],
    }, async (request, reply) => {
        const { sessionId } = request.cookies;
        const transactions = await (0, database_1.knex)('transactions')
            .where('session_id', sessionId)
            .select('*');
        return {
            transactions,
        };
    });
    app.get('/:id', {
        preHandler: [check_session_id_exists_1.checkSessionIdExists],
    }, async (request) => {
        const getTransactionParamsSchema = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        });
        const { id } = getTransactionParamsSchema.parse(request.params);
        const { sessionId } = request.cookies;
        const transaction = await (0, database_1.knex)('transactions')
            .where({
            id,
            session_id: sessionId,
        })
            .first();
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        return {
            transaction,
        };
    });
    app.get('/summary', {
        preHandler: [check_session_id_exists_1.checkSessionIdExists],
    }, async (request) => {
        const { sessionId } = request.cookies;
        const summary = await (0, database_1.knex)('transactions')
            .where('session_id', sessionId)
            .sum('amount', {
            as: 'amount',
        })
            .first();
        return {
            summary,
        };
    });
    app.post('/', async (request, reply) => {
        const createTransactionBodySchema = zod_1.z.object({
            title: zod_1.z.string(),
            amount: zod_1.z.number(),
            type: zod_1.z.enum(['credit', 'debit']),
        });
        const { amount, title, type } = createTransactionBodySchema.parse(request.body);
        let sessionId = request.cookies.sessionId;
        if (!sessionId) {
            sessionId = (0, crypto_1.randomUUID)();
            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            });
        }
        await (0, database_1.knex)('transactions').insert({
            id: (0, crypto_1.randomUUID)(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId,
        });
        return reply.status(201).send();
    });
}
exports.transactionsRoutes = transactionsRoutes;
