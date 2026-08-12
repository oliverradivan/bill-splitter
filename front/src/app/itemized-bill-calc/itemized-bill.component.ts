import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillService, IndividualBreakdown } from '../services/bill.service';

@Component({
  selector: 'app-itemized-bill',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './itemized-bill.component.html',
})
export class ItemizedBillComponent {
  private billService = inject(BillService);

  people = signal<IndividualBreakdown[]>([
    { name: 'Person 1', individual_amount: 0 },
    { name: 'Person 2', individual_amount: 0 }
  ]);

  sharedAmount = signal<number>(0);
  tipPercentage = signal<number>(15);

  subtotalIndividual = computed(() =>
    this.people().reduce((sum, p) => sum + (Number(p.individual_amount) || 0), 0)
  );

  subtotalTotal = computed(() => this.subtotalIndividual() + (Number(this.sharedAmount()) || 0));

  totalTip = computed(() =>
    roundToTwo(this.subtotalTotal() * ((Number(this.tipPercentage()) || 0) / 100))
  );

  grandTotal = computed(() => roundToTwo(this.subtotalTotal() + this.totalTip()));

  sharedPerPerson = computed(() => {
    const count = this.people().length;
    return count > 0 ? roundToTwo((Number(this.sharedAmount()) || 0) / count) : 0;
  });

  breakdown = computed(() => {
    const totalSub = this.subtotalTotal();
    const tip = this.totalTip();
    const sharedShare = this.sharedPerPerson();
    const grand = this.grandTotal();
    const people = this.people();

    let runningTotal = 0;

    return people.map((p, index) => {
      const personIndividual = Number(p.individual_amount) || 0;
      const personFoodTotal = personIndividual + sharedShare;

      const tipShare = totalSub > 0
        ? roundToTwo((personFoodTotal / totalSub) * tip)
        : 0;

      let totalToPay = roundToTwo(personFoodTotal + tipShare);

      const isLast = index === people.length - 1;
      if (isLast) {
        // Give the last person whatever's left over so the per-person
        // totals always sum to exactly grandTotal (fixes the
        // "missing penny" drift caused by rounding each share).
        totalToPay = roundToTwo(grand - runningTotal);
      } else {
        runningTotal += totalToPay;
      }

      return {
        name: p.name || 'Unnamed',
        individual: personIndividual,
        shared: sharedShare,
        tip: tipShare,
        totalToPay: totalToPay
      };
    });
  });

  addPerson() {
    const current = this.people();
    this.people.set([
      ...current,
      { name: `Person ${current.length + 1}`, individual_amount: 0 }
    ]);
  }

  removePerson(index: number) {
    if (this.people().length <= 1) return;
    const updated = this.people().filter((_, i) => i !== index);
    this.people.set(updated);
  }

  setTip(preset: number) {
    this.tipPercentage.set(preset);
  }

  updatePersonName(index: number, name: string) {
    const updated = [...this.people()];
    updated[index] = { ...updated[index], name };
    this.people.set(updated);
  }

  updatePersonAmount(index: number, amount: number) {
    const updated = [...this.people()];
    updated[index] = { ...updated[index], individual_amount: amount };
    this.people.set(updated);
  }

  saveToDatabase() {
    const payload = {
      people: this.people(),
      shared_amount: this.sharedAmount(),
      tip_percentage: this.tipPercentage()
    };

    this.billService.saveItemizedCalculation(payload).subscribe({
      next: (res) => console.log('Saved bill successfully:', res),
      error: (err) => console.error('error, couldn\'t save:', err)
    });
  }
}

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}