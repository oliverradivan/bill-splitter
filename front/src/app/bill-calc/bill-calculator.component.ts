import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillService, CalculationResult } from '../services/bill.service';

@Component({
  selector: 'app-bill-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bill-calculator.component.html',
  styleUrls: ['./bill-calculator.component.css']
})
export class BillCalculatorComponent {
  private billService = inject(BillService);


  billAmount = signal<number | null>(null);
  tipPercentage = signal<number | null>(null);
  peopleCount = signal<number | null>(null);

  history = signal<CalculationResult[]>([]);

  
  totalTip = computed(() => {
    const bill = this.billAmount() || 0;
    const tip = this.tipPercentage() || 0;
    return bill > 0 ? (bill * tip) / 100 : 0;
  });

  grandTotal = computed(() => {
    const bill = this.billAmount() || 0;
    return bill > 0 ? bill + this.totalTip() : 0;
  });

  amountPerPerson = computed(() => {
    const people = this.peopleCount() || 1;
    const total = this.grandTotal();
    return people > 0 ? total / people : 0;
  });

  setPresetTip(percentage: number) {
    this.tipPercentage.set(percentage);
  }

  saveCurrentCalculation() {
    if (!this.billAmount() || this.billAmount()! <= 0 || !this.peopleCount() || this.peopleCount()! <= 0) {
      alert('Please enter valid positive numbers for Bill and People count.');
      return;
    }

    this.billService.saveCalculation({
      bill_amount: this.billAmount()!,
      tip_percentage: this.tipPercentage()!,
      people_count: this.peopleCount()!
    }).subscribe({
      next: () => this.loadHistory(),
      error: (err) => console.error('Failed to save calculation', err)
    });
  }

  loadHistory() {
    this.billService.getHistory().subscribe({
      next: (data) => this.history.set(data),
      error: (err) => console.error('Failed to load history', err)
    });
  }
}