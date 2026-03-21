import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, OneToMany} from 'typeorm';
import { PlanEntrenamiento } from './plan-entrenamiento.entity';
import { GrupoMuscular } from './grupoMuscular.entity';
import { EjercicioDia } from './ejercicioDia.entity';

@Entity({ name: 'dia', schema: 'public' })
export class Dia {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => PlanEntrenamiento, (planEntrenamiento) => planEntrenamiento.dias)
    planEntrenamiento: PlanEntrenamiento;

    @ManyToOne(() => GrupoMuscular, (grupoMuscular) => grupoMuscular.dias)
    grupoMuscular: GrupoMuscular;

    @OneToMany(() => EjercicioDia, (ejercicioDia) => ejercicioDia.dia)
    ejerciciosDia: EjercicioDia[];

}
