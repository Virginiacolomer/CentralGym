import { Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import { Test } from './test.entity';

@Entity({ name: 'valor', schema: 'public' })
export class Valor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    numero: number;

    @ManyToOne(() => Test, (test) => test.valor)
    test: Test;
}
