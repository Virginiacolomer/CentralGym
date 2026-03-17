import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { PageHeaderCompactComponent } from '../../shared/page-header-compact/page-header-compact';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

type EditableExerciseRow = {
  exercise: string;
  workload: string;
};

type EditableTrainingDay = {
  label: string;
  expanded: boolean;
  rows: EditableExerciseRow[];
};

@Component({
  
  standalone: true,
  imports: [FormsModule, RouterLink, PageHeaderCompactComponent, PageBgComponent],
  templateUrl: './editar-plan.html',
  styleUrl: './editar-plan.css',
})
export class EditarPlan {
  selectedUserName = 'Usuario';

  days: EditableTrainingDay[] = [
    { label: 'Dia 1', expanded: false, rows: this.createEmptyRows() },
    { label: 'Dia 2', expanded: false, rows: this.createEmptyRows() },
    { label: 'Dia 3', expanded: false, rows: this.createEmptyRows() },
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

  private createEmptyRows(): EditableExerciseRow[] {
    return Array.from({ length: 5 }, () => ({ exercise: '', workload: '' }));
  }
}

