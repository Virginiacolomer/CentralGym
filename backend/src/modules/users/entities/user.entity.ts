import { Membresia } from 'src/modules/membresia/entities/membresia.entity';
import { PlanEntrenamiento } from 'src/modules/plan-entrenamiento/entities/plan-entrenamiento.entity';
import { Seguimiento } from 'src/modules/seguimiento/entities/seguimiento.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany} from 'typeorm';

@Entity({ name: 'user', schema: 'public' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  dni: string;

  @Column()
  email: string;

  @Column({ name: 'password_hash' })
  password_hash: string;

  @OneToOne(() => Seguimiento, seguimiento => seguimiento.user)
  seguimiento: Seguimiento;

  @OneToMany(() => Membresia, membresia => membresia.user)
  membresias: Membresia[];

  @OneToOne(() => PlanEntrenamiento, planEntrenamiento => planEntrenamiento.user)
  planEntrenamiento: PlanEntrenamiento;

}