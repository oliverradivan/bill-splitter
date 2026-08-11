import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CalculationPayload {
  bill_amount: number;
  tip_percentage: number;
  people_count: number;
}

export interface CalculationResult extends CalculationPayload {
  id: number;
  total_tip: number;
  grand_total: number;
  amount_per_person: number;
}

@Injectable({ providedIn: 'root' })
export class BillService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/v1';

  saveCalculation(payload: CalculationPayload): Observable<CalculationResult> {
    return this.http.post<CalculationResult>(`${this.apiUrl}/calculate`, payload);
  }

  getHistory(): Observable<CalculationResult[]> {
    return this.http.get<CalculationResult[]>(`${this.apiUrl}/history`);
  }
}