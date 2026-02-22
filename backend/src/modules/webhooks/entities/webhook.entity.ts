import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Issuer } from '../../issuers/entities/issuer.entity';

@Entity('webhooks')
export class Webhook {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    issuerId: string;

    @ManyToOne(() => Issuer)
    @JoinColumn({ name: 'issuerId' })
    issuer: Issuer;

    @Column()
    url: string;

    @Column()
    secret: string;

    @Column('simple-array')
    events: string[];

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
