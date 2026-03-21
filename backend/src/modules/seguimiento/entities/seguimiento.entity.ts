import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from 'typeorm';
import { Test } from './test.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ name: 'seguimiento', schema: 'public' })
export class Seguimiento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    estado: boolean;

    @OneToMany(() => Test, (test) => test.id)
    test: Test[];

    @ManyToOne(() => User, (user) => user.id)
     user: User;
}
