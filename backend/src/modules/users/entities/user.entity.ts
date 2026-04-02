import { Membresia } from 'src/modules/membresia/entities/membresia.entity';
import { Pago } from 'src/modules/membresia/entities/pago.entity';
import { UserMembresia } from 'src/modules/membresia/entities/userMembresia.entity';
import { PlanEntrenamiento } from 'src/modules/plan-entrenamiento/entities/plan-entrenamiento.entity';
import { Seguimiento } from 'src/modules/seguimiento/entities/seguimiento.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

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

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  password_hash: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.CLIENTE 
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 20, default: UserStatus.CREADO })
  estado: UserStatus;

  @OneToOne(() => Seguimiento, seguimiento => seguimiento.user, { nullable: true })
  seguimiento: Seguimiento | null;

  @OneToMany(() => UserMembresia, userMembresia => userMembresia.user)
  userMembresias: UserMembresia[];

  // Relacion de conveniencia para consultas con join explicito
  membresias?: Membresia[];

  @OneToMany(() => Pago, pago => pago.user)
  pagos: Pago[];

  @Column({ name: 'plan_entrenamiento_id', type: 'int', nullable: true })
  planEntrenamientoId: number | null;

  @ManyToOne(() => PlanEntrenamiento, { nullable: true })
  @JoinColumn({ name: 'plan_entrenamiento_id' })
  planEntrenamiento: PlanEntrenamiento | null;
}