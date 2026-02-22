import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './entities/webhook.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import { CreateWebhookDto, WebhookEvent } from './dto/create-webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(
        @InjectRepository(Webhook)
        private readonly webhookRepository: Repository<Webhook>,
        @InjectRepository(WebhookLog)
        private readonly webhookLogRepository: Repository<WebhookLog>,
    ) { }

    async create(issuerId: string, dto: CreateWebhookDto): Promise<Webhook> {
        const secret = crypto.randomBytes(32).toString('hex');
        const webhook = this.webhookRepository.create({
            ...dto,
            issuerId,
            secret,
        });
        return this.webhookRepository.save(webhook);
    }

    async findAll(issuerId: string): Promise<Webhook[]> {
        return this.webhookRepository.find({ where: { issuerId, isActive: true } });
    }

    async remove(id: string, issuerId: string): Promise<void> {
        await this.webhookRepository.update({ id, issuerId }, { isActive: false });
    }

    async testWebhook(id: string, issuerId: string) {
        const webhook = await this.webhookRepository.findOne({ where: { id, issuerId } });
        if (!webhook) {
            throw new Error('Webhook not found');
        }

        const testData = {
            message: 'This is a test webhook from StellarCert',
            test: true,
            timestamp: new Date().toISOString(),
        };

        return this.deliverWithRetry(webhook, 'test.event' as WebhookEvent, testData);
    }

    async triggerWebhook(issuerId: string, event: WebhookEvent, data: any) {
        const webhooks = await this.webhookRepository.find({
            where: { issuerId, isActive: true },
        });

        const activeWebhooks = webhooks.filter((w) => w.events.includes(event));

        for (const webhook of activeWebhooks) {
            // Run delivery in background
            this.deliverWithRetry(webhook, event, data).catch((err) => {
                this.logger.error(`Error in delivery background task: ${err.message}`);
            });
        }
    }

    private async deliverWithRetry(webhook: Webhook, event: WebhookEvent, data: any, attempt = 1) {
        const payload = JSON.stringify({
            id: crypto.randomUUID(),
            event,
            timestamp: new Date().toISOString(),
            data,
        });

        const signature = crypto
            .createHmac('sha256', webhook.secret)
            .update(payload)
            .digest('hex');

        let responseStatus: number | null = null;
        let responseBody: string | null = null;
        let isSuccess = false;

        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-StellarCert-Signature': signature,
                    'X-StellarCert-Event': event,
                },
                body: payload,
            });

            responseStatus = response.status;
            responseBody = await response.text();
            isSuccess = response.ok;
        } catch (error) {
            responseBody = error.message;
            this.logger.error(`Webhook delivery failed for ${webhook.url}: ${error.message}`);
        }

        const logEntry = this.webhookLogRepository.create({
            webhookId: webhook.id,
            event,
            payload,
            responseStatus,
            responseBody: responseBody || '',
            deliveryAttempt: attempt,
            isSuccess,
        });

        await this.webhookLogRepository.save(logEntry);

        if (!isSuccess && attempt < 5) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s, 16s...
            this.logger.log(`Retrying webhook delivery to ${webhook.url} in ${delay}ms (attempt ${attempt + 1})`);
            setTimeout(() => this.deliverWithRetry(webhook, event, data, attempt + 1), delay);
        }

        return { isSuccess, responseStatus };
    }

    async getLogs(webhookId: string, issuerId: string) {
        const webhook = await this.webhookRepository.findOne({ where: { id: webhookId, issuerId } });
        if (!webhook) {
            throw new Error('Webhook not found');
        }
        return this.webhookLogRepository.find({
            where: { webhookId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
}
