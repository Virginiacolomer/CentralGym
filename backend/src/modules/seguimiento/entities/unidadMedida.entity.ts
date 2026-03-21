import { Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import { Test } from './test.entity';

@Entity({ name: 'unidadMedida', schema: 'public' })
export class unidadMedida {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @OneToMany(() => Test, (test) => test.unidadMedida)
    test: Test[];
}
