import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne} from 'typeorm';
import { Dia } from './dia.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ name: 'planEntrenamiento', schema: 'public' })
export class PlanEntrenamiento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @OneToMany(() => Dia, (dia) => dia.planEntrenamiento)
    dias: Dia[];

    @OneToOne(() => User, user => user.planEntrenamiento)
    user: User;
}
