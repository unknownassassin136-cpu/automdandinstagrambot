import { Request, Response } from 'express';
import { WebhooksService } from './webhooks.service';
import { env } from '../../config/env';
import crypto from 'crypto';

export class WebhooksController {
  private webhooksService = new WebhooksService();

  verifyChallenge = (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === env.META_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  };

  handleWebhook = async (req: Request, res: Response) => {
    // 1. Validate signature using raw body
    const signature = req.headers['x-hub-signature-256'] as string;
    if (!signature) {
      console.error('Missing x-hub-signature-256 header');
      res.status(401).send('Unauthorized');
      return;
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      console.error('Missing raw body for webhook verification');
      res.status(500).send('Server Error');
      return;
    }

    const expectedSignature = `sha256=${crypto.createHmac('sha256', env.INSTAGRAM_APP_SECRET).update(rawBody).digest('hex')}`;

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      console.error('Expected:', expectedSignature);
      console.error('Received:', signature);
      if (env.NODE_ENV !== 'production') {
        console.warn('Bypassing signature check in development mode');
      } else {
        res.status(401).send('Unauthorized');
        return;
      }
    }

    // Always return 200 OK immediately to Meta
    res.status(200).send('EVENT_RECEIVED');

    try {
      await this.webhooksService.processIncomingWebhook(req.body);
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  };
}
