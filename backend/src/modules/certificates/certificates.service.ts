import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { WebhooksService } from '../webhooks/webhooks.service';
import { WebhookEvent } from '../webhooks/dto/create-webhook.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    private readonly webhooksService: WebhooksService,
  ) { }

  async findAll(): Promise<Certificate[]> {
    return this.certificateRepository.find();
  }

  async findOne(id: string): Promise<Certificate> {
    const cert = await this.certificateRepository.findOne({ where: { id } });
    if (!cert) throw new NotFoundException('Certificate not found');
    return cert;
  }

  async issue(issuerId: string, data: Partial<Certificate>): Promise<Certificate> {
    const cert = this.certificateRepository.create({
      ...data,
      isRevoked: false,
      issuedAt: new Date(),
    });
    const saved = await this.certificateRepository.save(cert);

    // Trigger webhook
    this.webhooksService.triggerWebhook(issuerId, WebhookEvent.CERTIFICATE_ISSUED, saved);

    return saved;
  }

  async revoke(issuerId: string, id: string, reason: string): Promise<Certificate> {
    const cert = await this.findOne(id);
    cert.isRevoked = true;
    cert.revocationReason = reason;
    const saved = await this.certificateRepository.save(cert);

    // Trigger webhook
    this.webhooksService.triggerWebhook(issuerId, WebhookEvent.CERTIFICATE_REVOKED, saved);

    return saved;
  }

  async verify(issuerId: string, id: string): Promise<any> {
    const cert = await this.findOne(id);
    const result = {
      id: cert.id,
      certificateId: cert.certificateId,
      isValid: !cert.isRevoked,
      issuedAt: cert.issuedAt,
      issuerName: cert.issuerName,
    };

    // Trigger webhook
    this.webhooksService.triggerWebhook(issuerId, WebhookEvent.CERTIFICATE_VERIFIED, result);

    return result;
  }
}
