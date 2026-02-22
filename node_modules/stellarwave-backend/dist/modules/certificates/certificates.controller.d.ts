import { CertificatesService } from './certificates.service';
export declare class CertificatesController {
    private readonly certificatesService;
    constructor(certificatesService: CertificatesService);
    findAll(): Promise<import("./entities/certificate.entity").Certificate[]>;
    findOne(id: string): Promise<import("./entities/certificate.entity").Certificate>;
    issue(req: any, data: any): Promise<import("./entities/certificate.entity").Certificate>;
    revoke(req: any, id: string, reason: string): Promise<import("./entities/certificate.entity").Certificate>;
    verify(req: any, id: string): Promise<any>;
}
