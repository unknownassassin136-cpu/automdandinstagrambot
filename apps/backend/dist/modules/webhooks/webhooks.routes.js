"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooksRouter = void 0;
const express_1 = require("express");
const webhooks_controller_1 = require("./webhooks.controller");
exports.webhooksRouter = (0, express_1.Router)();
const controller = new webhooks_controller_1.WebhooksController();
exports.webhooksRouter.get('/instagram', controller.verifyChallenge);
exports.webhooksRouter.post('/instagram', controller.handleWebhook);
