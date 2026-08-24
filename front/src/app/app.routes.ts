import { Routes } from '@angular/router';
import { ItemizedBillComponent } from './itemized-bill-calc/itemized-bill.component';

export const routes: Routes = [
  { path: '', component: ItemizedBillComponent },
  { path: '**', redirectTo: '' }
];