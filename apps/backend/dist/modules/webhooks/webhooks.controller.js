"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const webhooks_service_1 = require("./webhooks.service");
const env_1 = require("../../config/env");
const crypto_1 = __importDefault(require("crypto"));
class WebhooksController {
    webhooksService = new webhooks_service_1.WebhooksService();
    verifyChallenge = (req, res) => {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode === 'subscribe' && token === env_1.env.META_VERIFY_TOKEN) {
            res.status(200).send(challenge);
        }
        else {
            res.status(403).send('Forbidden');
        }
    };
    handleWebhook = async (req, res) => {
        // 1. Validate signature using raw body
        const signature = req.headers['x-hub-signature-256'];
        if (!signature) {
            console.error('Missing x-hub-signature-256 header');
            res.status(401).send('Unauthorized');
            return;
        }
        const rawBody = req.rawBody;
        if (!rawBody) {
            console.error('Missing raw body for webhook verification');
            res.status(500).send('Server Error');
            return;
        }
        const expectedSignature = `sha256=${crypto_1.default.createHmac('sha256', env_1.env.META_APP_SECRET).update(rawBody).digest('hex')}`;
        if (signature !== expectedSignature) {
            console.error('Invalid webhook signature');
            console.error('Expected:', expectedSignature);
            console.error('Received:', signature);
            if (env_1.env.NODE_ENV !== 'production') {
                console.warn('Bypassing signature check in development mode');
            }
            else {
                res.status(401).send('Unauthorized');
                return;
            }
        }
        // Always return 200 OK immediately to Meta
        res.status(200).send('EVENT_RECEIVED');
        try {
            await this.webhooksService.processIncomingWebhook(req.body);
        }
        catch (err) {
            console.error('Webhook processing error:', err);
        }
    };
}
exports.WebhooksController = WebhooksController;
