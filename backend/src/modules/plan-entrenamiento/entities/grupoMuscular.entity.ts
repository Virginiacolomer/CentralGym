import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne, OneToMany} from 'typeorm';
import { Dia } from './dia.entity';
import { Ejercicio } from './ejercicio.entity';

@Entity({ name: 'grupoMuscular', schema: 'public' })
export class GrupoMuscular {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @OneToMany(() => Dia, (dia) => dia.grupoMuscular)
    dias: Dia[];

    @OneToMany(() => Ejercicio, (ejercicio) => ejercicio.grupoMuscular)
    ejercicios: Ejercicio[];
}
