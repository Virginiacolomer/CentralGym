import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ name: 'plan_entrenamiento', schema: 'public' })
export class PlanEntrenamiento {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    nombre: string;

    @Column({ type: 'varchar', nullable: true })
    descripcion: string | null;

    @Column({ type: 'varchar', length: 20, default: 'predeterminado' })
    tipo: 'predeterminado' | 'editado';

    @Column({ name: 'cantidad_dias', type: 'smallint', default: 7 })
    cantidadDias: number;

    @Column({
        name: 'ejercicios',
        type: 'jsonb',
        default: () => "'[null,null,null,null,null,null,null]'::jsonb",
    })
    ejercicios: Array<number[] | null>;

    @Column({
        name: 'repeticiones',
        type: 'jsonb',
        default: () => "'[null,null,null,null,null,null,null]'::jsonb",
    })
    repeticiones: Array<string[] | null>;

    @OneToMany(() => User, (user) => user.planEntrenamiento)
    users: User[];
}
