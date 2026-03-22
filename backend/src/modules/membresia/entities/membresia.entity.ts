import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { TipoMembresia } from './tipoMembresia.entity';
import { Pago } from './pago.entity';
import { UserMembresia } from './userMembresia.entity';

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

    @ManyToOne(() => TipoMembresia, tipoMembresia => tipoMembresia.membresias)
    tipoMembresia: TipoMembresia;

    @OneToMany(() => Pago, pago => pago.membresia)
    pagos: Pago[];

    @OneToMany(() => UserMembresia, userMembresia => userMembresia.membresia)
    userMembresias: UserMembresia[];
}
