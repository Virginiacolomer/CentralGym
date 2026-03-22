import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Membresia } from './membresia.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ name: 'pago', schema: 'public' })
export class Pago {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    mes: number;

    @ManyToOne(() => Membresia, membresia => membresia.pagos)
    @JoinColumn({ name: 'membresia_id' })
    membresia: Membresia;

    @ManyToOne(() => User, user => user.pagos, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User | null;
}
