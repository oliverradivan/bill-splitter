import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ============================================================
// Simple calculator
// ============================================================

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

// ============================================================
// Itemized calculator
// ============================================================

export interface IndividualBreakdown {
  name: string;
  individual_amount: number;
}

export interface ItemizedCalculationPayload {
  people: IndividualBreakdown[];
  shared_amount: number;
  tip_percentage: number;
}

export interface PersonResult {
  name: string;
  individual_amount: number;
  shared_share: number;
  tip_share: number;
  total_to_pay: number;
}

export interface ItemizedCalculationResult {
  id: number;
  people_results: PersonResult[];
  grand_total: number;
  total_tip: number;
  shared_total: number;
}

@Injectable({ providedIn: 'root' })
export class BillService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/v1';

  // --- simple calculator ---

  saveCalculation(payload: CalculationPayload): Observable<CalculationResult> {
    return this.http.post<CalculationResult>(`${this.apiUrl}/calculate`, payload);
  }

  getHistory(): Observable<CalculationResult[]> {
    return this.http.get<CalculationResult[]>(`${this.apiUrl}/history`);
  }

  // --- itemized calculator ---

  saveItemizedCalculation(payload: ItemizedCalculationPayload): Observable<ItemizedCalculationResult> {
    return this.http.post<ItemizedCalculationResult>(`${this.apiUrl}/itemized-calculate`, payload);
  }

  getItemizedHistory(): Observable<ItemizedCalculationResult[]> {
    return this.http.get<ItemizedCalculationResult[]>(`${this.apiUrl}/itemized-history`);
  }
}