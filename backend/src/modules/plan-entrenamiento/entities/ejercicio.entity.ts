import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, OneToMany} from 'typeorm';
import { GrupoMuscular } from './grupoMuscular.entity';
import { EjercicioDia } from './ejercicioDia.entity';

@Entity({ name: 'ejercicio', schema: 'public' })
export class Ejercicio {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;
    
    @ManyToOne(() => GrupoMuscular, (grupoMuscular) => grupoMuscular.ejercicios)
    grupoMuscular: GrupoMuscular;

    @OneToMany(() => EjercicioDia, (ejercicioDia) => ejercicioDia.ejercicio)
    ejerciciosDia: EjercicioDia[];
}