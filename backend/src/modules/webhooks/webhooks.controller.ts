import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('webhooks')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Post()
    @ApiOperation({ summary: 'Register a new webhook' })
    create(@Request() req: any, @Body() createWebhookDto: CreateWebhookDto) {
        // Assuming req.user.id is the issuer identifier
        return this.webhooksService.create(req.user.id, createWebhookDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all registered webhooks for the issuer' })
    findAll(@Request() req: any) {
        return this.webhooksService.findAll(req.user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deactivate a webhook' })
    remove(@Request() req: any, @Param('id') id: string) {
        return this.webhooksService.remove(id, req.user.id);
    }

    @Post(':id/test')
    @ApiOperation({ summary: 'Trigger a test event for the webhook' })
    async test(@Request() req: any, @Param('id') id: string) {
        return this.webhooksService.testWebhook(id, req.user.id);
    }

    @Get(':id/logs')
    @ApiOperation({ summary: 'Get delivery logs for a webhook' })
    getLogs(@Request() req: any, @Param('id') id: string) {
        return this.webhooksService.getLogs(id, req.user.id);
    }
}
