import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, finalize, map, timeout } from 'rxjs';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';
import {
  CatalogoEjercicio,
  CatalogoGrupoMuscularResumen,
  PlanEntrenamientoApiService,
  CreateGrupoMuscularResponse,
  CreateEjercicioResponse,
} from '../../core/services/plan-entrenamiento-api.service';

@Component({
  standalone: true,
  imports: [PageHeaderCompactComponent, PageBgComponent, FormsModule, CommonModule],
  templateUrl: './crear-ejercicios.html',
  styleUrl: './crear-ejercicios.css',
})
export class CrearEjercicios implements OnInit {
  private readonly planEntrenamientoApiService = inject(PlanEntrenamientoApiService);
  private readonly ejerciciosPorGrupoCache = new Map<number, CatalogoEjercicio[]>();
  private readonly requestTimeoutMs = 2500;
  private readonly cacheKey = 'crear-ejercicios-cache-v1';
  private statusTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private createEjercicioUnlockTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private createGrupoUnlockTimeoutId: ReturnType<typeof setTimeout> | null = null;

  gruposMusculares: CatalogoGrupoMuscularResumen[] = [];
  nuevoGrupoNombre = '';
  selectedGrupoId: number | null = null;
  selectedEjercicios: CatalogoEjercicio[] = [];
  ejercicioNombre = '';

  isLoadingGrupos = false;
  isLoadingGrupoDetalle = false;
  hasLoadedGrupoDetalle = false;
  isCreatingGrupo = false;
  isCreatingEjercicio = false;
  loadingError = false;

  statusMessage = '';
  statusType: 'success' | 'error' | 'info' = 'info';
  grupoFeedbackMessage = '';
  grupoFeedbackType: 'success' | 'error' | 'info' = 'info';
  ejercicioFeedbackMessage = '';
  ejercicioFeedbackType: 'success' | 'error' | 'info' = 'info';

  ngOnInit(): void {
    this.hydrateFromLocalCache();
    this.loadGruposMusculares();
  }

  private hydrateFromLocalCache(): void {
    try {
      const rawCache = localStorage.getItem(this.cacheKey);
      if (!rawCache) {
        return;
      }

      const parsed = JSON.parse(rawCache) as {
        grupos?: CatalogoGrupoMuscularResumen[];
        ejerciciosPorGrupo?: Record<string, CatalogoEjercicio[]>;
      };

      if (Array.isArray(parsed.grupos) && parsed.grupos.length > 0) {
        this.gruposMusculares = parsed.grupos;
        this.selectedGrupoId = parsed.grupos[0].id;
      }

      if (parsed.ejerciciosPorGrupo && typeof parsed.ejerciciosPorGrupo === 'object') {
        for (const [groupId, ejercicios] of Object.entries(parsed.ejerciciosPorGrupo)) {
          const numericGroupId = Number(groupId);
          if (Number.isInteger(numericGroupId) && Array.isArray(ejercicios)) {
            this.ejerciciosPorGrupoCache.set(numericGroupId, ejercicios);
          }
        }
      }

      if (this.selectedGrupoId) {
        const cachedEjercicios = this.ejerciciosPorGrupoCache.get(this.selectedGrupoId);
        if (cachedEjercicios) {
          this.selectedEjercicios = cachedEjercicios;
        }
      }
    } catch (error) {
      console.warn('No se pudo hidratar cache local de crear ejercicios:', error);
    }
  }

  private persistLocalCache(): void {
    try {
      const ejerciciosPorGrupo: Record<string, CatalogoEjercicio[]> = {};
      this.ejerciciosPorGrupoCache.forEach((value, key) => {
        ejerciciosPorGrupo[String(key)] = value;
      });

      localStorage.setItem(
        this.cacheKey,
        JSON.stringify({
          grupos: this.gruposMusculares,
          ejerciciosPorGrupo,
        }),
      );
    } catch (error) {
      console.warn('No se pudo persistir cache local de crear ejercicios:', error);
    }
  }

  public loadGruposMusculares(): void {
    this.isLoadingGrupos = true;
    this.loadingError = false;
    this.planEntrenamientoApiService
      .getCatalogoGruposMuscularesResumen()
      .pipe(
        timeout(this.requestTimeoutMs),
        catchError((errorResumen) => {
          console.warn('Fallo o timeout en grupos resumen. Se usa fallback:', errorResumen);

          return this.planEntrenamientoApiService.getCatalogoGruposMusculares().pipe(
            timeout(this.requestTimeoutMs),
            map((gruposCompletos) =>
              gruposCompletos.map((grupo) => ({
                id: grupo.id,
                nombre: grupo.nombre,
              })),
            ),
          );
        }),
      )
      .pipe(finalize(() => (this.isLoadingGrupos = false)))
      .subscribe({
        next: (grupos) => {
          this.gruposMusculares = grupos;
          this.persistLocalCache();
          this.loadingError = false;
          if (grupos.length > 0) {
            if (!this.selectedGrupoId || !grupos.some((grupo) => grupo.id === this.selectedGrupoId)) {
              this.selectedGrupoId = grupos[0].id;
            }
            this.loadSelectedGrupoDetalle();
          } else {
            this.selectedGrupoId = null;
            this.selectedEjercicios = [];
          }
        },
        error: (err) => {
          this.loadingError = true;
          if (this.gruposMusculares.length === 0) {
            this.setStatus('Error al cargar los grupos musculares. Intenta de nuevo.', 'error');
          }
          console.error('Error al cargar grupos:', err);
        },
      });
  }

  onGrupoChange(grupoId: number | string | null): void {
    const parsedId = typeof grupoId === 'string' ? Number(grupoId) : grupoId;
    this.selectedGrupoId = Number.isInteger(parsedId) ? parsedId : null;
    this.loadSelectedGrupoDetalle();
  }

  private loadSelectedGrupoDetalle(): void {
    if (!this.selectedGrupoId) {
      this.selectedEjercicios = [];
      this.hasLoadedGrupoDetalle = false;
      return;
    }

    const requestedGroupId = this.selectedGrupoId;

    const cached = this.ejerciciosPorGrupoCache.get(requestedGroupId);
    const hasCachedData = Array.isArray(cached);

    if (cached) {
      this.selectedEjercicios = cached;
      this.hasLoadedGrupoDetalle = true;
    } else {
      this.selectedEjercicios = [];
      this.hasLoadedGrupoDetalle = false;
    }

    // If we already have cached data, refresh in background without blocking UI.
    this.isLoadingGrupoDetalle = !hasCachedData;
    this.planEntrenamientoApiService
      .getEjerciciosByGrupoMuscularId(requestedGroupId)
      .pipe(
        timeout(this.requestTimeoutMs),
        catchError((errorEjercicios) => {
          console.warn('Fallo o timeout en ejercicios por grupo. Se usa fallback:', errorEjercicios);

          return this.planEntrenamientoApiService
            .getGrupoMuscularById(requestedGroupId)
            .pipe(
              timeout(this.requestTimeoutMs),
              map((grupo) => grupo.ejercicios ?? []),
            );
        }),
      )
      .pipe(
        finalize(() => {
          if (!hasCachedData) {
            this.isLoadingGrupoDetalle = false;
          }
        }),
      )
      .subscribe({
        next: (ejercicios) => {
          this.ejerciciosPorGrupoCache.set(requestedGroupId, ejercicios);
          this.persistLocalCache();

          // Ignore stale responses when user changed group before request finished.
          if (this.selectedGrupoId !== requestedGroupId) {
            return;
          }

          this.selectedEjercicios = ejercicios;
          this.hasLoadedGrupoDetalle = true;
          this.isLoadingGrupoDetalle = false;
        },
        error: (err) => {
          if (this.selectedGrupoId !== requestedGroupId) {
            return;
          }

          const cachedForGroup = this.ejerciciosPorGrupoCache.get(requestedGroupId) ?? [];

          if (cachedForGroup.length > 0) {
            this.selectedEjercicios = cachedForGroup;
            this.hasLoadedGrupoDetalle = true;
            return;
          }

          this.selectedEjercicios = [];
          this.hasLoadedGrupoDetalle = false;
          this.isLoadingGrupoDetalle = false;
          this.setStatus('No se pudo cargar el detalle del grupo muscular seleccionado.', 'error');
          console.error('Error al cargar detalle de grupo:', err);
        },
      });
  }

  createGrupoMuscular(): void {
    const nombre = this.nuevoGrupoNombre.trim();
    this.statusMessage = '';
    this.grupoFeedbackMessage = '';

    if (!nombre) {
      this.grupoFeedbackMessage = 'El nombre del grupo muscular es obligatorio';
      this.grupoFeedbackType = 'error';
      return;
    }

    const normalizedNombre = this.normalizeName(nombre);
    const existsGroup = this.gruposMusculares.some(
      (grupo) => this.normalizeName(grupo.nombre) === normalizedNombre,
    );

    if (existsGroup) {
      this.grupoFeedbackMessage = 'El grupo muscular ya existe y no se puede volver a crear.';
      this.grupoFeedbackType = 'error';
      this.nuevoGrupoNombre = '';
      return;
    }

    this.isCreatingGrupo = true;
    this.grupoFeedbackMessage = 'Creando grupo muscular...';
    this.grupoFeedbackType = 'info';

    const optimisticId = -Date.now();
    const optimisticGroup: CatalogoGrupoMuscularResumen = {
      id: optimisticId,
      nombre: normalizedNombre,
    };

    this.gruposMusculares = [...this.gruposMusculares, optimisticGroup].sort((a, b) =>
      a.nombre.localeCompare(b.nombre),
    );
    this.selectedGrupoId = optimisticId;
    this.selectedEjercicios = [];
    this.hasLoadedGrupoDetalle = true;
    this.ejerciciosPorGrupoCache.set(optimisticId, []);
    this.persistLocalCache();

    // Once the optimistic group is visible in the list, hide the creating banner.
    this.grupoFeedbackMessage = '';

    if (this.createGrupoUnlockTimeoutId) {
      clearTimeout(this.createGrupoUnlockTimeoutId);
    }

    // Safety unlock to avoid frozen UI if request hangs.
    this.createGrupoUnlockTimeoutId = setTimeout(() => {
      this.isCreatingGrupo = false;
      this.grupoFeedbackMessage = 'La solicitud esta tardando demasiado. Actualizando lista...';
      this.grupoFeedbackType = 'info';
      this.loadGruposMusculares();
    }, this.requestTimeoutMs);

    this.planEntrenamientoApiService
      .createGrupoMuscular({ nombre })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.isCreatingGrupo = false;
          if (this.createGrupoUnlockTimeoutId) {
            clearTimeout(this.createGrupoUnlockTimeoutId);
            this.createGrupoUnlockTimeoutId = null;
          }
        }),
      )
      .subscribe({
        next: (response: CreateGrupoMuscularResponse) => {
          this.isCreatingGrupo = false;
          this.grupoFeedbackMessage = `Grupo muscular "${response.nombre}" creado correctamente`;
          this.grupoFeedbackType = 'success';
          this.nuevoGrupoNombre = '';

          const groupsWithoutOptimistic = this.gruposMusculares.filter((grupo) => grupo.id !== optimisticId);
          const existsRealGroup = groupsWithoutOptimistic.some((grupo) => grupo.id === response.id);

          this.gruposMusculares = existsRealGroup
            ? groupsWithoutOptimistic
            : [...groupsWithoutOptimistic, { id: response.id, nombre: response.nombre }].sort((a, b) =>
                a.nombre.localeCompare(b.nombre),
              );

          this.selectedGrupoId = response.id;
          this.selectedEjercicios = [];
          this.hasLoadedGrupoDetalle = true;
          this.ejerciciosPorGrupoCache.delete(optimisticId);
          this.ejerciciosPorGrupoCache.set(response.id, []);
          this.persistLocalCache();

          // Sync with backend in background in case server applied additional normalization.
          this.loadGruposMusculares();
        },
        error: (err) => {
          this.isCreatingGrupo = false;
          this.gruposMusculares = this.gruposMusculares.filter((grupo) => grupo.id !== optimisticId);
          this.ejerciciosPorGrupoCache.delete(optimisticId);

          if (this.selectedGrupoId === optimisticId) {
            this.selectedGrupoId = this.gruposMusculares.length > 0 ? this.gruposMusculares[0].id : null;
            this.loadSelectedGrupoDetalle();
          }

          const message = this.getErrorMessage(err, 'Error al crear el grupo muscular');
          this.grupoFeedbackMessage = message;
          this.grupoFeedbackType = 'error';

          this.nuevoGrupoNombre = '';
          this.persistLocalCache();
          console.error(err);
        },
      });
  }

  createEjercicio(): void {
    const nombre = this.ejercicioNombre.trim();
    this.statusMessage = '';
    this.ejercicioFeedbackMessage = '';

    if (!nombre) {
      this.ejercicioFeedbackMessage = 'El nombre del ejercicio es obligatorio';
      this.ejercicioFeedbackType = 'error';
      return;
    }

    if (!this.selectedGrupoId) {
      this.ejercicioFeedbackMessage = 'Debes seleccionar un grupo muscular';
      this.ejercicioFeedbackType = 'error';
      return;
    }

    const grupoMuscularId = Number(this.selectedGrupoId);
    if (!Number.isInteger(grupoMuscularId) || grupoMuscularId <= 0) {
      this.ejercicioFeedbackMessage = 'Debes seleccionar un grupo muscular valido';
      this.ejercicioFeedbackType = 'error';
      return;
    }

    const normalizedNombre = this.normalizeName(nombre);
    const existsInSelectedGroup = this.selectedEjercicios.some(
      (ejercicio) => this.normalizeName(ejercicio.nombre) === normalizedNombre,
    );

    if (existsInSelectedGroup) {
      this.ejercicioFeedbackMessage = 'El ejercicio ya existe y no se puede volver a crear.';
      this.ejercicioFeedbackType = 'error';
      this.ejercicioNombre = '';
      return;
    }

    // Optimistic update: mostrar inmediatamente en la lista
    const tempId = -Date.now() - Math.random();
    const newEjercicio = { id: tempId, nombre: normalizedNombre };
    const currentGroupId = this.selectedGrupoId;
    const currentList = this.ejerciciosPorGrupoCache.get(currentGroupId) ?? this.selectedEjercicios;
    const updatedList = [...currentList, newEjercicio].sort((a, b) => 
      a.nombre.localeCompare(b.nombre)
    );

    this.ejerciciosPorGrupoCache.set(grupoMuscularId, updatedList);
    this.selectedEjercicios = updatedList;
    this.hasLoadedGrupoDetalle = true;
    this.persistLocalCache();

    // Limpiar campo e input inmediatamente
    this.ejercicioNombre = '';
    this.ejercicioFeedbackMessage = '';

    // Safety unlock to avoid frozen UI if request hangs.
    if (this.createEjercicioUnlockTimeoutId) {
      clearTimeout(this.createEjercicioUnlockTimeoutId);
    }

    this.createEjercicioUnlockTimeoutId = setTimeout(() => {
      this.isCreatingEjercicio = false;
      this.ejercicioFeedbackMessage = 'La solicitud esta tardando demasiado. Actualizando lista...';
      this.ejercicioFeedbackType = 'info';
      this.loadSelectedGrupoDetalle();
    }, this.requestTimeoutMs);

    this.planEntrenamientoApiService
      .createEjercicio({ nombre: normalizedNombre, grupoMuscularId })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.isCreatingEjercicio = false;
          if (this.createEjercicioUnlockTimeoutId) {
            clearTimeout(this.createEjercicioUnlockTimeoutId);
            this.createEjercicioUnlockTimeoutId = null;
          }
        }),
      )
      .subscribe({
        next: (response: CreateEjercicioResponse) => {
          this.ejercicioFeedbackMessage = `✓ "${response.nombre}" creado correctamente`;
          this.ejercicioFeedbackType = 'success';

          // Reemplazar ID temporal con ID real del servidor
          if (currentGroupId) {
            const currentList = this.ejerciciosPorGrupoCache.get(currentGroupId) ?? this.selectedEjercicios;
            const updatedList = currentList
              .map((ejercicio) => 
                ejercicio.id === tempId 
                  ? { id: response.id, nombre: response.nombre }
                  : ejercicio
              )
              .sort((a, b) => a.nombre.localeCompare(b.nombre));

            this.ejerciciosPorGrupoCache.set(currentGroupId, updatedList);
            this.selectedEjercicios = updatedList;
          }

          this.persistLocalCache();

          // Sync with backend in background
          this.loadSelectedGrupoDetalle();
        },
        error: (err) => {
          // Revertir optimistic update: remover el ejercicio temporal
          if (currentGroupId) {
            const currentList = this.ejerciciosPorGrupoCache.get(currentGroupId) ?? this.selectedEjercicios;
            const filteredList = currentList.filter((ejercicio) => ejercicio.id !== tempId);
            
            this.ejerciciosPorGrupoCache.set(currentGroupId, filteredList);
            this.selectedEjercicios = filteredList;
          }

          const message = this.getErrorMessage(err, 'Error al crear el ejercicio');
          this.ejercicioFeedbackMessage = message;
          this.ejercicioFeedbackType = 'error';

          this.persistLocalCache();
          console.error(err);
        },
      });
  }

  private normalizeName(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toUpperCase();
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const err = error as {
      status?: number;
      name?: string;
      message?: string;
      error?: {
        message?: string | string[];
      };
    };

    // Handle timeout errors
    if (err?.name === 'TimeoutError' || err?.status === 0) {
      return 'La solicitud tardó demasiado. El servidor podría estar lento. Intenta nuevamente.';
    }

    if (err?.status === 409) {
      return 'El ejercicio ya existe y no se puede volver a crear.';
    }

    const message = err?.error?.message;
    if (Array.isArray(message)) {
      return message.join(' | ');
    }

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }

    // Handle generic error message from the error object
    if (typeof err?.message === 'string' && err.message.length > 0) {
      return err.message;
    }

    return fallback;
  }

  private setStatus(message: string, type: 'success' | 'error' | 'info'): void {
    if (this.statusTimeoutId) {
      clearTimeout(this.statusTimeoutId);
      this.statusTimeoutId = null;
    }

    this.statusMessage = message;
    this.statusType = type;

    // Auto-clear success messages after 3 seconds
    if (type === 'success') {
      this.statusTimeoutId = setTimeout(() => {
        this.statusMessage = '';
        this.statusTimeoutId = null;
      }, 3000);
    }
  }

  trackByGrupoId(index: number, grupo: CatalogoGrupoMuscularResumen): number {
    return grupo.id;
  }
}
