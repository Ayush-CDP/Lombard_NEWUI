import { Component } from '@angular/core';
import { LoaderService } from './loader-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
})
export class Loader {
constructor(public loaderService: LoaderService) {}
}
