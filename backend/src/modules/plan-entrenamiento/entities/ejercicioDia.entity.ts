import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne, OneToMany, ManyToOne} from 'typeorm';
import { Dia } from './dia.entity';
import { Ejercicio } from './ejercicio.entity';

@Entity({ name: 'ejercicioDia', schema: 'public' })
export class EjercicioDia {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cantidad: string;

    @ManyToOne(() => Dia, (dia) => dia.ejerciciosDia)
    dia: Dia;

    @ManyToOne(() => Ejercicio, (ejercicio) => ejercicio.ejerciciosDia)
    ejercicio: Ejercicio;
}
