import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


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

@Injectable({ 
  providedIn: 'root'
})
export class BillService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/v1';


   
  //itemized calculator

  saveItemizedCalculation(payload: ItemizedCalculationPayload): Observable<ItemizedCalculationResult> {
    return this.http.post<ItemizedCalculationResult>(`${this.apiUrl}/itemized-calculate`, payload);
  }

  getItemizedHistory(): Observable<ItemizedCalculationResult[]> {
    return this.http.get<ItemizedCalculationResult[]>(`${this.apiUrl}/itemized-history`);
  }
}