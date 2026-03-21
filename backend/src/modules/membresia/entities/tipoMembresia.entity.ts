import { Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import { Membresia } from './membresia.entity';

@Entity({ name: 'tipoMembresia', schema: 'public' })
export class TipoMembresia {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;
    
    @OneToMany(() => Membresia, membresia => membresia.tipoMembresia)
    membresias: Membresia[];
}
