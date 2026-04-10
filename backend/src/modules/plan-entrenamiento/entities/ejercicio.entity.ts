import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { GrupoMuscular } from './grupoMuscular.entity';

@Entity({ name: 'ejercicio', schema: 'public' })
export class Ejercicio {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombre!: string;
    
    @ManyToOne(() => GrupoMuscular, (grupoMuscular: GrupoMuscular) => grupoMuscular.ejercicios)
    grupoMuscular!: GrupoMuscular;
}