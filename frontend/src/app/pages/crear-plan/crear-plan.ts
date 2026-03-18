import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

type DayConfig = {
  label: string;
  expanded: boolean;
  exercises: ExerciseConfig[];
};

type ExerciseConfig = {
  muscleGroup: string;
  exercise: string;
  customExerciseName: string;
  workload: string;
};

@Component({
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent, FormsModule],
  templateUrl: './crear-plan.html',
  styleUrl: './crear-plan.css',
})
export class CrearPlan {
  readonly otherExerciseValue = '__otro__';

  planTitle = '';
  frequencyDays = 1;
  description = '';
  savingStatus = '';

  configuredDays: DayConfig[] = [
    {
      label: 'Dia 1',
      expanded: false,
      exercises: [{ muscleGroup: '', exercise: '', customExerciseName: '', workload: '' }],
    },
  ];

  readonly muscleGroups: string[] = [
    'Pecho',
    'Espalda',
    'Piernas',
    'Hombros',
    'Biceps',
    'Triceps',
    'Core',
    'Gluteos',
  ];

  private exercisesByGroup: Record<string, string[]> = {
    Pecho: ['Press banca', 'Press inclinado', 'Aperturas con mancuernas', 'Fondos'],
    Espalda: ['Remo con barra', 'Jalon al pecho', 'Dominadas', 'Pullover en polea'],
    Piernas: ['Sentadilla', 'Prensa inclinada', 'Peso muerto rumano', 'Zancadas'],
    Hombros: ['Press militar', 'Elevaciones laterales', 'Pajaros', 'Face pull'],
    Biceps: ['Curl con barra', 'Curl martillo', 'Curl concentrado', 'Curl en banco Scott'],
    Triceps: ['Extension en polea', 'Press frances', 'Fondos en banco', 'Patada de triceps'],
    Core: ['Plancha', 'Crunch en polea', 'Elevacion de piernas', 'Rueda abdominal'],
    Gluteos: ['Hip thrust', 'Patada de gluteo', 'Puente de gluteo', 'Abducciones'],
  };

  get canConfigureDays(): boolean {
    return this.planTitle.trim().length > 0 && this.frequencyDays > 0;
  }

  onFrequencyInput(value: number): void {
    const normalized = Number.isFinite(value) ? Math.trunc(value) : 1;
    this.frequencyDays = Math.min(7, Math.max(1, normalized));
    this.syncConfiguredDays();
  }

  toggleDay(index: number): void {
    this.configuredDays = this.configuredDays.map((day, dayIndex) => ({
      ...day,
      expanded: dayIndex === index ? !day.expanded : day.expanded,
    }));
  }

  addExercise(dayIndex: number): void {
    const day = this.configuredDays[dayIndex];
    if (!day) {
      return;
    }

    day.exercises.push({ muscleGroup: '', exercise: '', customExerciseName: '', workload: '' });
  }

  removeExercise(dayIndex: number, exerciseIndex: number): void {
    const day = this.configuredDays[dayIndex];
    if (!day || day.exercises.length <= 1) {
      return;
    }

    day.exercises.splice(exerciseIndex, 1);
  }

  onMuscleGroupChange(dayIndex: number, exerciseIndex: number): void {
    const day = this.configuredDays[dayIndex];
    if (!day) {
      return;
    }

    day.exercises[exerciseIndex].exercise = '';
    day.exercises[exerciseIndex].customExerciseName = '';
  }

  getExercisesForGroup(group: string): string[] {
    return this.exercisesByGroup[group] ?? [];
  }

  isOtherExerciseSelected(exercise: ExerciseConfig): boolean {
    return exercise.exercise === this.otherExerciseValue;
  }

  addCustomExercise(dayIndex: number, exerciseIndex: number): void {
    const day = this.configuredDays[dayIndex];
    if (!day) {
      return;
    }

    const exercise = day.exercises[exerciseIndex];
    if (!exercise || !exercise.muscleGroup) {
      return;
    }

    const customName = exercise.customExerciseName.trim();
    if (!customName) {
      return;
    }

    const existingList = this.getExercisesForGroup(exercise.muscleGroup);
    const alreadyExists = existingList.some(
      (name) => name.toLocaleLowerCase('es-AR') === customName.toLocaleLowerCase('es-AR'),
    );

    if (!alreadyExists) {
      this.exercisesByGroup[exercise.muscleGroup] = [...existingList, customName];
    }

    exercise.exercise = customName;
    exercise.customExerciseName = '';
  }

  savePlan(): void {
    if (!this.canConfigureDays || this.planTitle.trim().length === 0) {
      this.savingStatus = 'Por favor completa el título del plan';
      setTimeout(() => {
        this.savingStatus = '';
      }, 3000);
      return;
    }

    this.savingStatus = `Simulacion: plan "${this.planTitle}" listo para guardar`;
    setTimeout(() => {
      this.savingStatus = '';
    }, 3000);
  }

  private syncConfiguredDays(): void {
    const safeFrequency = Math.min(7, Math.max(1, this.frequencyDays));

    this.configuredDays = Array.from({ length: safeFrequency }, (_, index) => {
      const existing = this.configuredDays[index];

      return {
        label: `Dia ${index + 1}`,
        expanded: existing?.expanded ?? false,
        exercises: existing?.exercises?.length
          ? existing.exercises
          : [{ muscleGroup: '', exercise: '', customExerciseName: '', workload: '' }],
      };
    });
  }
}
