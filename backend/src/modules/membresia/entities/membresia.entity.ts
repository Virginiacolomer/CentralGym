import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany} from 'typeorm';
import { TipoMembresia } from './tipoMembresia.entity';
import { Pago } from './pago.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ name: 'membresia', schema: 'public' })
export class Membresia {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    dias: number;

    @Column ()
    costo: number;

    @ManyToOne(() => TipoMembresia, tipoMembresia => tipoMembresia.id)
    tipoMembresia: TipoMembresia;

    @OneToMany(() => Pago, pago => pago.membresia)
    pagos: Pago[];

    @ManyToOne(() => User, user => user.id)
    user: User;
}
