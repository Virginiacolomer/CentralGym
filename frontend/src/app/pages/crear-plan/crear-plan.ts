import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, firstValueFrom, timeout } from 'rxjs';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';
import {
  CatalogoEjercicio,
  CatalogoGrupoMuscular,
  CreateEjercicioResponse,
  CreatePlanEntrenamientoRequest,
  PlanEntrenamientoApiService,
} from '../../core/services/plan-entrenamiento-api.service';

type ExerciseRow = {
  muscleGroupId: number | null;
  ejercicioId: number | null;
  customExerciseName: string;
  repeticiones: string;
};

type DayConfig = {
  label: string;
  expanded: boolean;
  rows: ExerciseRow[];
};

@Component({
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent, FormsModule],
  templateUrl: './crear-plan.html',
  styleUrl: './crear-plan.css',
})
export class CrearPlan implements OnInit, OnDestroy {
  private readonly planEntrenamientoApiService = inject(PlanEntrenamientoApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private statusTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly customExerciseOptionId = -1;

  planTitle = '';
  frequencyDays = 1;
  description = '';
  savingStatus = '';
  savingStatusType: 'success' | 'error' | 'info' = 'info';
  isSaving = false;
  isLoadingCatalog = false;

  configuredDays: DayConfig[] = [this.createEmptyDay(1)];
  muscleGroups: CatalogoGrupoMuscular[] = [];

  ngOnInit(): void {
    this.loadCatalogo();
  }

  ngOnDestroy(): void {
    if (this.statusTimeoutId) {
      clearTimeout(this.statusTimeoutId);
      this.statusTimeoutId = null;
    }

  }

  get canConfigureDays(): boolean {
    return this.planTitle.trim().length > 0 && this.frequencyDays > 0;
  }

  onFrequencyInput(value: number): void {
    const normalized = Number.isFinite(value) ? Math.trunc(value) : 1;
    this.frequencyDays = Math.min(7, Math.max(1, normalized));
    this.syncConfiguredDays();
  }

  toggleDay(index: number): void {
    this.configuredDays = this.configuredDays.map((day, i) => ({
      ...day,
      expanded: i === index ? !day.expanded : day.expanded,
    }));
  }

  addRow(dayIndex: number): void {
    this.configuredDays[dayIndex]?.rows.push(this.createEmptyRow());
  }

  removeRow(dayIndex: number, rowIndex: number): void {
    const day = this.configuredDays[dayIndex];
    if (!day || day.rows.length <= 1) {
      return;
    }
    day.rows.splice(rowIndex, 1);
  }

  onMuscleGroupChange(dayIndex: number, rowIndex: number): void {
    const row = this.configuredDays[dayIndex]?.rows[rowIndex];
    if (row) {
      row.ejercicioId = null;
      row.customExerciseName = '';
    }
  }

  onExerciseChange(dayIndex: number, rowIndex: number): void {
    const row = this.configuredDays[dayIndex]?.rows[rowIndex];
    if (!row) {
      return;
    }

    if (row.ejercicioId !== this.customExerciseOptionId) {
      row.customExerciseName = '';
    }
  }

  onCustomExerciseInput(dayIndex: number, rowIndex: number, value: string): void {
    const row = this.configuredDays[dayIndex]?.rows[rowIndex];
    if (!row) {
      return;
    }

    row.customExerciseName = this.normalizeExerciseName(value);
  }

  isCustomExerciseSelected(row: ExerciseRow): boolean {
    return row.ejercicioId === this.customExerciseOptionId;
  }

  getExercisesForGroup(groupId: number | null): CatalogoEjercicio[] {
    if (!groupId) {
      return [];
    }
    return this.muscleGroups.find((g) => g.id === groupId)?.ejercicios ?? [];
  }

  savePlan(): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();

    this.ensureCustomExercisesCreated()
      .then(() => {
        const payload = this.buildPayload();
        if (!payload) {
          this.isSaving = false;
          this.cdr.detectChanges();
          return;
        }

        this.showStatus('Guardando plan en la base de datos...', 'info');

        this.planEntrenamientoApiService
          .createPlan(payload)
          .pipe(
            timeout(15000),
            finalize(() => {
              this.isSaving = false;
              this.cdr.detectChanges();
            }),
          )
          .subscribe({
            next: () => {
              this.resetForm();
              this.showStatus(
                `Plan "${payload.nombre}" registrado correctamente en la base de datos.`,
                'success',
                3000,
              );
              this.cdr.detectChanges();
            },
            error: (error: unknown) => {
              const backendMessage =
                typeof error === 'object' && error !== null && 'error' in error
                  ? (error as { error?: { message?: string | string[] } }).error?.message
                  : null;

              const message = Array.isArray(backendMessage)
                ? backendMessage[0]
                : backendMessage ?? 'No se pudo crear el plan. Intenta nuevamente.';

              this.showStatus(message, 'error', 8000);
              this.cdr.detectChanges();
            },
          });
      })
      .catch((error: unknown) => {
        const backendMessage =
          typeof error === 'object' && error !== null && 'error' in error
            ? (error as { error?: { message?: string | string[] } }).error?.message
            : null;

        const message = Array.isArray(backendMessage)
          ? backendMessage[0]
          : backendMessage ?? (error instanceof Error ? error.message : 'No se pudo crear el plan. Intenta nuevamente.');

        this.showStatus(message, 'error', 8000);
        this.isSaving = false;
        this.cdr.detectChanges();
      });
  }

  private syncConfiguredDays(): void {
    const count = Math.min(7, Math.max(1, this.frequencyDays));
    this.configuredDays = Array.from({ length: count }, (_, i) => {
      return this.configuredDays[i] ?? this.createEmptyDay(i + 1);
    });
  }

  private createEmptyDay(num: number): DayConfig {
    return { label: `Dia ${num}`, expanded: false, rows: [this.createEmptyRow()] };
  }

  private createEmptyRow(): ExerciseRow {
    return { muscleGroupId: null, ejercicioId: null, customExerciseName: '', repeticiones: '' };
  }

  private normalizeExerciseName(value: string): string {
    return String(value ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
  }

  private exerciseExists(nombre: string): boolean {
    const normalized = this.normalizeExerciseName(nombre);
    return this.muscleGroups.some((group) =>
      (group.ejercicios ?? []).some(
        (ejercicio) => this.normalizeExerciseName(ejercicio.nombre) === normalized,
      ),
    );
  }

  private async ensureCustomExercisesCreated(): Promise<void> {
    for (let dayIndex = 0; dayIndex < this.frequencyDays; dayIndex += 1) {
      const day = this.configuredDays[dayIndex];
      if (!day) {
        continue;
      }

      for (let rowIndex = 0; rowIndex < day.rows.length; rowIndex += 1) {
        const row = day.rows[rowIndex];

        if (row.ejercicioId !== this.customExerciseOptionId) {
          continue;
        }

        if (!row.muscleGroupId) {
          throw new Error(`Debes seleccionar un grupo muscular en Dia ${dayIndex + 1}, fila ${rowIndex + 1}.`);
        }

        const normalizedName = this.normalizeExerciseName(row.customExerciseName);
        if (!normalizedName) {
          throw new Error(`Debes escribir el nombre del ejercicio en Dia ${dayIndex + 1}, fila ${rowIndex + 1}.`);
        }

        if (this.exerciseExists(normalizedName)) {
          throw new Error(`El ejercicio "${normalizedName}" ya existe y no se puede volver a crear.`);
        }

        const created = await firstValueFrom(
          this.planEntrenamientoApiService.createEjercicio({
            nombre: normalizedName,
            grupoMuscularId: row.muscleGroupId,
          }),
        );

        this.appendExerciseToCatalog(created);
        row.ejercicioId = created.id;
        row.customExerciseName = created.nombre;
      }
    }
  }

  private appendExerciseToCatalog(created: CreateEjercicioResponse): void {
    this.muscleGroups = this.muscleGroups.map((group) => {
      if (group.id !== created.grupoMuscularId) {
        return group;
      }

      const alreadyExists = (group.ejercicios ?? []).some((exercise) => exercise.id === created.id);
      if (alreadyExists) {
        return group;
      }

      const ejercicios = [...(group.ejercicios ?? []), { id: created.id, nombre: created.nombre }]
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      return {
        ...group,
        ejercicios,
      };
    });
  }

  private loadCatalogo(): void {
    this.isLoadingCatalog = true;
    this.planEntrenamientoApiService.getCatalogoGruposMusculares().subscribe({
      next: (groups) => {
        this.muscleGroups = groups;
      },
      error: () => {
        this.showStatus('No se pudo cargar el catalogo de ejercicios.', 'error');
      },
      complete: () => {
        this.isLoadingCatalog = false;
      },
    });
  }

  private buildPayload(): CreatePlanEntrenamientoRequest | null {
    const nombre = this.planTitle.trim();
    if (!nombre) {
      this.showStatus('Por favor completa el titulo del plan.', 'error');
      return null;
    }

    try {
      const ejercicios: Array<number[] | null> = Array.from({ length: 7 }, (_, i) => {
        if (i >= this.frequencyDays) {
          return null;
        }

        const day = this.configuredDays[i];
        if (!day || day.rows.length === 0) {
          throw new Error(`El Dia ${i + 1} no tiene ejercicios configurados.`);
        }

        return day.rows.map((row, rowIndex) => {
          if (!row.ejercicioId || row.ejercicioId <= 0) {
            throw new Error(`Debes seleccionar un ejercicio en Dia ${i + 1}, fila ${rowIndex + 1}.`);
          }
          return row.ejercicioId;
        });
      });

      const repeticiones: Array<string[] | null> = Array.from({ length: 7 }, (_, i) => {
        if (i >= this.frequencyDays) {
          return null;
        }

        const day = this.configuredDays[i];
        if (!day || day.rows.length === 0) {
          throw new Error(`El Dia ${i + 1} no tiene repeticiones configuradas.`);
        }

        return day.rows.map((row, rowIndex) => {
          const valor = row.repeticiones.trim();
          if (!valor) {
            throw new Error(`Debes indicar repeticiones en Dia ${i + 1}, fila ${rowIndex + 1}.`);
          }
          return valor;
        });
      });

      return {
        nombre,
        descripcion: this.description.trim() || undefined,
        cantidadDias: this.frequencyDays,
        ejercicios,
        repeticiones,
      };
    } catch (error) {
      this.showStatus(
        error instanceof Error ? error.message : 'Hay datos invalidos en el formulario.',
        'error',
      );
      return null;
    }
  }

  private resetForm(): void {
    this.planTitle = '';
    this.description = '';
    this.frequencyDays = 1;
    this.configuredDays = [this.createEmptyDay(1)];
  }

  private showStatus(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    timeoutMs?: number,
  ): void {
    this.savingStatus = message;
    this.savingStatusType = type;

    if (this.statusTimeoutId) {
      clearTimeout(this.statusTimeoutId);
      this.statusTimeoutId = null;
    }

    if (!timeoutMs || timeoutMs <= 0) {
      return;
    }

    this.statusTimeoutId = setTimeout(() => {
      this.savingStatus = '';
      this.statusTimeoutId = null;
    }, timeoutMs);
  }
}
