import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

type ExerciseRow = {
  exercise: string;
  workload: string;
};

type TrainingDay = {
  label: string;
  expanded: boolean;
  exercises: ExerciseRow[];
};

@Component({
  
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './ver-plan.html',
  styleUrl: './ver-plan.css',
})
export class VerPlan {
  selectedUserName = 'Usuario';

  days: TrainingDay[] = [
    {
      label: 'Dia 1',
      expanded: false,
      exercises: [
        { exercise: 'Sentadilla hack', workload: '3x15' },
        { exercise: 'Prensa inclinada', workload: '4x12' },
        { exercise: 'Camilla de cuadriceps', workload: '3x15' },
        { exercise: 'Peso muerto rumano', workload: '3x12' },
        { exercise: 'Gemelos de pie', workload: '4x20' },
      ],
    },
    {
      label: 'Dia 2',
      expanded: false,
      exercises: [
        { exercise: 'Press banca plano', workload: '4x10' },
        { exercise: 'Remo con barra', workload: '4x12' },
        { exercise: 'Press militar', workload: '3x12' },
        { exercise: 'Jalon al pecho', workload: '3x15' },
        { exercise: 'Curl de biceps', workload: '3x12' },
      ],
    },
    {
      label: 'Dia 3',
      expanded: false,
      exercises: [
        { exercise: 'Hip thrust', workload: '4x12' },
        { exercise: 'Zancadas caminando', workload: '3x14' },
        { exercise: 'Abductores', workload: '3x18' },
        { exercise: 'Fondos en paralelas', workload: '3x10' },
        { exercise: 'Plancha abdominal', workload: '4x30s' },
      ],
    },
  ];

  constructor(private readonly route: ActivatedRoute) {
    this.route.queryParamMap.subscribe((params) => {
      const userName = params.get('usuario')?.trim();
      this.selectedUserName = userName && userName.length > 0 ? userName : 'Usuario';
    });
  }

  toggleDay(index: number): void {
    this.days = this.days.map((day, dayIndex) => ({
      ...day,
      expanded: dayIndex === index ? !day.expanded : day.expanded,
    }));
  }
}

