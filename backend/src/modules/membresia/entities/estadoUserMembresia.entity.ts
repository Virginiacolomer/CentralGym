import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserMembresia } from './userMembresia.entity';

@Entity({ name: 'estadoUserMembresia', schema: 'public' })
export class EstadoUserMembresia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  nombre!: string;

  @OneToMany(() => UserMembresia, (userMembresia: UserMembresia) => userMembresia.estado)
  userMembresias!: UserMembresia[];
}
