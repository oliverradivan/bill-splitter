import { Routes } from '@angular/router';
import { BillCalculatorComponent } from './bill-calc/bill-calculator.component';

export const routes: Routes = [
  { path: '', component: BillCalculatorComponent },
  { path: '**', redirectTo: '' }
];