import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany} from 'typeorm';
import { Seguimiento } from './seguimiento.entity';
import { unidadMedida } from './unidadMedida.entity';
import { Valor } from './valor.entity';


@Entity({ name: 'test', schema: 'public' })
export class Test {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @ManyToOne(() => Seguimiento, (seguimiento) => seguimiento.test)
    seguimiento: Seguimiento;

    @ManyToOne(() => unidadMedida, (unidadMedida) => unidadMedida.test)
    unidadMedida: unidadMedida;

    @OneToMany(() => Valor, (valor) => valor.test)
    valor: Valor[];
}
