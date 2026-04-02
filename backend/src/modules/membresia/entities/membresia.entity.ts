import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TipoMembresia } from './tipoMembresia.entity';
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
    @JoinColumn({ name: 'tipoMembresiaId' })
    tipoMembresia: TipoMembresia;

    @OneToMany(() => UserMembresia, userMembresia => userMembresia.membresia)
    userMembresias: UserMembresia[];
}
