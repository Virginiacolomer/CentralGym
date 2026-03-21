import { Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import { Membresia } from './membresia.entity';

@Entity({ name: 'pago', schema: 'public' })
export class Pago {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    mes: number;
    @ManyToOne(() => Membresia, membresia => membresia.id)
    membresia: Membresia;
}
