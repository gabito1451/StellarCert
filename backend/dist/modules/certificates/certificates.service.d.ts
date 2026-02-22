import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { WebhooksService } from '../webhooks/webhooks.service';
export declare class CertificatesService {
    private readonly certificateRepository;
    private readonly webhooksService;
    constructor(certificateRepository: Repository<Certificate>, webhooksService: WebhooksService);
    findAll(): Promise<Certificate[]>;
    findOne(id: string): Promise<Certificate>;
    issue(issuerId: string, data: Partial<Certificate>): Promise<Certificate>;
    revoke(issuerId: string, id: string, reason: string): Promise<Certificate>;
    verify(issuerId: string, id: string): Promise<any>;
}
