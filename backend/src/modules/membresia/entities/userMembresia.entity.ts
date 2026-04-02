import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, Column, OneToMany, Index } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Membresia } from './membresia.entity';
import { EstadoUserMembresia } from './estadoUserMembresia.entity';
import { Pago } from './pago.entity';

@Entity({ name: 'user_membresia', schema: 'public' })
@Index('uq_user_membresia_user_membresia', ['userId', 'membresiaId'], { unique: true })
export class UserMembresia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'membresia_id', type: 'int' })
  membresiaId: number;

  @Column({ name: 'estado_id', type: 'int', nullable: true })
  estadoId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.userMembresias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Membresia, membresia => membresia.userMembresias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membresia_id' })
  membresia: Membresia;

  @ManyToOne(() => EstadoUserMembresia, estado => estado.userMembresias)
  @JoinColumn({ name: 'estado_id' })
  estado: EstadoUserMembresia;

  @OneToMany(() => Pago, pago => pago.userMembresia)
  pagos: Pago[];
}
