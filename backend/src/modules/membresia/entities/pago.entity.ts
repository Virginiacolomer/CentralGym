import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Membresia } from './membresia.entity';
import { UserMembresia } from './userMembresia.entity';

@Entity({ name: 'pago', schema: 'public' })
export class Pago {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'user_id', type: 'int', nullable: true })
    userId!: number | null;

    @Column({ name: 'user_membresia_id', type: 'int', nullable: true })
    userMembresiaId!: number | null;

    @Column({ name: 'membresiaId', type: 'int', nullable: true })
    membresiaId!: number | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @ManyToOne(() => User, (user: User) => user.pagos, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User | null;

    @ManyToOne(() => UserMembresia, (userMembresia: UserMembresia) => userMembresia.pagos, { nullable: true })
    @JoinColumn({ name: 'user_membresia_id' })
    userMembresia!: UserMembresia | null;

    @ManyToOne(() => Membresia, { nullable: true })
    @JoinColumn({ name: 'membresiaId' })
    membresia!: Membresia | null;
}
