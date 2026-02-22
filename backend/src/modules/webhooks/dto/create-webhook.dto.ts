import { IsUrl, IsArray, IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum WebhookEvent {
    CERTIFICATE_ISSUED = 'certificate.issued',
    CERTIFICATE_REVOKED = 'certificate.revoked',
    CERTIFICATE_VERIFIED = 'certificate.verified',
}

export class CreateWebhookDto {
    @IsUrl()
    @IsNotEmpty()
    url: string;

    @IsArray()
    @IsEnum(WebhookEvent, { each: true })
    events: WebhookEvent[];
}
