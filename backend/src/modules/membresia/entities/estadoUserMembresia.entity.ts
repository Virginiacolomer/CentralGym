import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserMembresia } from './userMembresia.entity';

@Entity({ name: 'estadoUserMembresia', schema: 'public' })
export class EstadoUserMembresia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @OneToMany(() => UserMembresia, userMembresia => userMembresia.estado)
  userMembresias: UserMembresia[];
}
