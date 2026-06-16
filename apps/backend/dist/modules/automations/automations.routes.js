"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.automationsRouter = void 0;
const express_1 = require("express");
const automations_controller_1 = require("./automations.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
exports.automationsRouter = (0, express_1.Router)();
const controller = new automations_controller_1.AutomationsController();
exports.automationsRouter.use(auth_middleware_1.authMiddleware);
// Rules
exports.automationsRouter.post('/rules', controller.createRule);
exports.automationsRouter.get('/rules', controller.getRules);
exports.automationsRouter.put('/rules/:ruleId', controller.updateRule);
exports.automationsRouter.delete('/rules/:ruleId', controller.deleteRule);
// Templates
exports.automationsRouter.post('/templates', controller.createTemplate);
exports.automationsRouter.get('/templates', controller.getTemplates);
exports.automationsRouter.put('/templates/:templateId', controller.updateTemplate);
exports.automationsRouter.delete('/templates/:templateId', controller.deleteTemplate);
