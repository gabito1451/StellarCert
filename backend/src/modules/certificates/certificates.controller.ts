import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('certificates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('certificates')
export class CertificatesController {
    constructor(private readonly certificatesService: CertificatesService) { }

    @Get()
    @ApiOperation({ summary: 'List all certificates' })
    findAll() {
        return this.certificatesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get certificate details' })
    findOne(@Param('id') id: string) {
        return this.certificatesService.findOne(id);
    }

    @Post('issue')
    @ApiOperation({ summary: 'Issue a new certificate' })
    issue(@Request() req: any, @Body() data: any) {
        return this.certificatesService.issue(req.user.id, data);
    }

    @Patch(':id/revoke')
    @ApiOperation({ summary: 'Revoke a certificate' })
    revoke(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
        return this.certificatesService.revoke(req.user.id, id, reason);
    }

    @Post(':id/verify')
    @ApiOperation({ summary: 'Verify a certificate' })
    verify(@Request() req: any, @Param('id') id: string) {
        return this.certificatesService.verify(req.user.id, id);
    }
}
