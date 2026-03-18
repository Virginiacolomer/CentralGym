import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
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

type PredefinedPlan = {
  id: string;
  title: string;
  frequency: number;
  days: TrainingDay[];
};

@Component({
  
  standalone: true,
  imports: [FormsModule, PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './ver-plan.html',
  styleUrl: './ver-plan.css',
})
export class VerPlan {
  selectedUserName = 'Usuario';
  isEditing = false;
  membershipFrequency = 1;
  availablePlans: PredefinedPlan[] = [];
  selectedPlanId = '';

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

  readonly predefinedPlans: PredefinedPlan[] = [
    {
      id: 'plan-2-fuerza',
      title: 'Plan fuerza 2 dias',
      frequency: 2,
      days: [
        {
          label: 'Dia 1',
          expanded: false,
          exercises: [
            { exercise: 'Sentadilla', workload: '4x8' },
            { exercise: 'Prensa', workload: '4x10' },
            { exercise: 'Gemelos', workload: '4x20' },
          ],
        },
        {
          label: 'Dia 2',
          expanded: false,
          exercises: [
            { exercise: 'Press banca', workload: '4x8' },
            { exercise: 'Remo', workload: '4x10' },
            { exercise: 'Curl biceps', workload: '3x12' },
          ],
        },
      ],
    },
    {
      id: 'plan-3-hipertrofia',
      title: 'Plan hipertrofia 3 dias',
      frequency: 3,
      days: [
        {
          label: 'Dia 1',
          expanded: false,
          exercises: [
            { exercise: 'Sentadilla hack', workload: '3x15' },
            { exercise: 'Camilla cuadriceps', workload: '3x15' },
            { exercise: 'Peso muerto rumano', workload: '3x12' },
          ],
        },
        {
          label: 'Dia 2',
          expanded: false,
          exercises: [
            { exercise: 'Press banca inclinado', workload: '4x10' },
            { exercise: 'Jalon al pecho', workload: '4x12' },
            { exercise: 'Elevaciones laterales', workload: '3x15' },
          ],
        },
        {
          label: 'Dia 3',
          expanded: false,
          exercises: [
            { exercise: 'Hip thrust', workload: '4x12' },
            { exercise: 'Abductores', workload: '3x18' },
            { exercise: 'Plancha abdominal', workload: '4x30s' },
          ],
        },
      ],
    },
    {
      id: 'plan-7-pase-libre',
      title: 'Plan pase libre 7 dias',
      frequency: 7,
      days: Array.from({ length: 7 }, (_, index) => ({
        label: `Dia ${index + 1}`,
        expanded: false,
        exercises: [
          { exercise: 'Circuito general', workload: '3 vueltas' },
          { exercise: 'Cardio', workload: '20 min' },
          { exercise: 'Core', workload: '3x20' },
        ],
      })),
    },
  ];

  private originalDays: TrainingDay[] = [];

  constructor(private readonly route: ActivatedRoute) {
    this.route.queryParamMap.subscribe((params) => {
      const userName = params.get('usuario')?.trim();
      this.selectedUserName = userName && userName.length > 0 ? userName : 'Usuario';
      const frecuencia = params.get('frecuencia');
      if (frecuencia) {
        this.membershipFrequency = parseInt(frecuencia, 10) || 1;
        this.loadAvailablePlans();
      }
    });
    this.saveOriginalDays();
  }

  loadAvailablePlans(): void {
    this.availablePlans = this.predefinedPlans.filter((plan) => plan.frequency === this.membershipFrequency);
  }

  get exerciseOptions(): string[] {
    const planExercises = this.predefinedPlans.flatMap((plan) =>
      plan.days.flatMap((day) => day.exercises.map((row) => row.exercise.trim())),
    );
    const currentExercises = this.days.flatMap((day) => day.exercises.map((row) => row.exercise.trim()));

    const unique = new Map<string, string>();
    [...planExercises, ...currentExercises]
      .filter((name) => name.length > 0)
      .forEach((name) => {
        const key = this.normalizeText(name);
        if (!unique.has(key)) {
          unique.set(key, name);
        }
      });

    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b, 'es-AR'));
  }

  assignPredefinedPlan(): void {
    if (!this.selectedPlanId) {
      return;
    }

    const plan = this.availablePlans.find((item) => item.id === this.selectedPlanId);
    if (!plan) {
      return;
    }

    this.days = plan.days.map((planDay) => ({
      label: planDay.label,
      expanded: false,
      exercises: planDay.exercises.map((ex) => ({
        exercise: ex.exercise,
        workload: ex.workload,
      })),
    }));

    this.selectedPlanId = '';
    this.saveOriginalDays();
  }

  addExerciseRow(dayIndex: number): void {
    const day = this.days[dayIndex];
    if (!day) {
      return;
    }

    day.exercises = [...day.exercises, { exercise: '', workload: '' }];
  }

  validateExerciseSelection(dayIndex: number, rowIndex: number): void {
    const day = this.days[dayIndex];
    const row = day?.exercises[rowIndex];
    if (!row) {
      return;
    }

    const typedValue = row.exercise.trim();
    if (!typedValue) {
      return;
    }

    const matched = this.exerciseOptions.find(
      (name) => this.normalizeText(name) === this.normalizeText(typedValue),
    );

    row.exercise = matched ?? '';
  }

  removeExerciseRow(dayIndex: number, rowIndex: number): void {
    const day = this.days[dayIndex];
    if (!day) {
      return;
    }

    day.exercises = day.exercises.filter((_, index) => index !== rowIndex);
  }

  toggleDay(index: number): void {
    this.days = this.days.map((day, dayIndex) => ({
      ...day,
      expanded: dayIndex === index ? !day.expanded : day.expanded,
    }));
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.restoreOriginalDays();
  }

  savePlan(): void {
    this.isEditing = false;
    this.saveOriginalDays();
  }

  private saveOriginalDays(): void {
    this.originalDays = JSON.parse(JSON.stringify(this.days));
  }

  private restoreOriginalDays(): void {
    this.days = JSON.parse(JSON.stringify(this.originalDays));
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}

