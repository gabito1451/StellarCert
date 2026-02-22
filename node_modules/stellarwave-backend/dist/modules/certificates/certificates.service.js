"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const certificate_entity_1 = require("./entities/certificate.entity");
const webhooks_service_1 = require("../webhooks/webhooks.service");
const create_webhook_dto_1 = require("../webhooks/dto/create-webhook.dto");
let CertificatesService = class CertificatesService {
    certificateRepository;
    webhooksService;
    constructor(certificateRepository, webhooksService) {
        this.certificateRepository = certificateRepository;
        this.webhooksService = webhooksService;
    }
    async findAll() {
        return this.certificateRepository.find();
    }
    async findOne(id) {
        const cert = await this.certificateRepository.findOne({ where: { id } });
        if (!cert)
            throw new common_1.NotFoundException('Certificate not found');
        return cert;
    }
    async issue(issuerId, data) {
        const cert = this.certificateRepository.create({
            ...data,
            isRevoked: false,
            issuedAt: new Date(),
        });
        const saved = await this.certificateRepository.save(cert);
        this.webhooksService.triggerWebhook(issuerId, create_webhook_dto_1.WebhookEvent.CERTIFICATE_ISSUED, saved);
        return saved;
    }
    async revoke(issuerId, id, reason) {
        const cert = await this.findOne(id);
        cert.isRevoked = true;
        cert.revocationReason = reason;
        const saved = await this.certificateRepository.save(cert);
        this.webhooksService.triggerWebhook(issuerId, create_webhook_dto_1.WebhookEvent.CERTIFICATE_REVOKED, saved);
        return saved;
    }
    async verify(issuerId, id) {
        const cert = await this.findOne(id);
        const result = {
            id: cert.id,
            certificateId: cert.certificateId,
            isValid: !cert.isRevoked,
            issuedAt: cert.issuedAt,
            issuerName: cert.issuerName,
        };
        this.webhooksService.triggerWebhook(issuerId, create_webhook_dto_1.WebhookEvent.CERTIFICATE_VERIFIED, result);
        return result;
    }
};
exports.CertificatesService = CertificatesService;
exports.CertificatesService = CertificatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(certificate_entity_1.Certificate)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        webhooks_service_1.WebhooksService])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map