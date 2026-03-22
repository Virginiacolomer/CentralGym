import { Entity, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, Column } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Membresia } from './membresia.entity';
import { EstadoUserMembresia } from './estadoUserMembresia.entity';

@Entity({ name: 'user_membresia', schema: 'public' })
export class UserMembresia {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId: number;

  @PrimaryColumn({ name: 'membresia_id', type: 'int' })
  membresiaId: number;

  @Column({ name: 'estado_id', type: 'int' })
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
}
