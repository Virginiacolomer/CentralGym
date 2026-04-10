import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TipoMembresia } from './tipoMembresia.entity';
import { UserMembresia } from './userMembresia.entity';

@Entity({ name: 'membresia', schema: 'public' })
export class Membresia {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombre!: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    descripcion!: string | null;

    @Column({ type: 'varchar', length: 100 })
    dias!: string;

    @Column ()
    costo!: number;

  @ManyToOne(() => TipoMembresia, (tipoMembresia: TipoMembresia) => tipoMembresia.membresias)
  @JoinColumn({ name: 'tipoMembresiaId' })
  tipoMembresia!: TipoMembresia;

  @OneToMany(() => UserMembresia, (userMembresia: UserMembresia) => userMembresia.membresia)
    userMembresias!: UserMembresia[];
}
