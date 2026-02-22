import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Webhook } from './webhook.entity';

@Entity('webhook_logs')
export class WebhookLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    webhookId: string;

    @ManyToOne(() => Webhook)
    @JoinColumn({ name: 'webhookId' })
    webhook: Webhook;

    @Column()
    event: string;

    @Column({ type: 'text' })
    payload: string;

    @Column({ nullable: true })
    responseStatus: number | null;

    @Column({ type: 'text', nullable: true })
    responseBody: string | null;

    @Column({ default: 1 })
    deliveryAttempt: number;

    @Column({ default: false })
    isSuccess: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
