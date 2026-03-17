import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header';
import { PageBgComponent } from '../../shared/page-bg/page-bg';

@Component({
  selector: 'app-membresias',
  standalone: true,
  imports: [PageHeaderComponent, PageBgComponent],
  templateUrl: './membresias.html',
  styleUrl: './membresias.css',
})
export class Membresias {
  // Referencia de tipo para evitar diagnosticos de importacion no usada en este entorno.
  protected readonly headerComponentRef = PageHeaderComponent;
}
