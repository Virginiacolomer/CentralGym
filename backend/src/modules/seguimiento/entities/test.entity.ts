import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Seguimiento } from './seguimiento.entity';
import { unidadMedida } from './unidadMedida.entity';

export type ValorMensual = {
    mes: string;
    valor: number;
};


@Entity({ name: 'test', schema: 'public' })
export class Test {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @ManyToOne(() => Seguimiento, (seguimiento) => seguimiento.test)
    @JoinColumn({ name: 'seguimiento_id' })
    seguimiento: Seguimiento;

    @ManyToOne(() => unidadMedida, (unidadMedida) => unidadMedida.test, { nullable: true })
    @JoinColumn({ name: 'unidad_medida_id' })
    unidadMedida: unidadMedida;

    @Column({ name: 'valores_mensuales', type: 'jsonb', default: () => "'[]'::jsonb" })
    valoresMensuales: ValorMensual[];
}
