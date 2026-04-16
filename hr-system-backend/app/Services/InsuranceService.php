<?php

namespace App\Services;

use App\Models\Payroll;
use App\Models\Insurance;
use Illuminate\Support\Facades\DB;

class InsuranceService
{
    /**
     * Update insurance plan cost and recalculate all affected payroll totals.
     * Uses the same calculation logic as PayrollController::calculateTotal().
     */
    public function updatePlan(Insurance $insurance, float $newValue): Insurance
    {
        return DB::transaction(function () use ($insurance, $newValue) {
            $insurance->update([
                'old_cost' => $insurance->cost,
                'cost'     => $newValue,
            ]);

            // Recalculate all non-paid payrolls that use this insurance
            $payrolls = Payroll::where('insurance_id', $insurance->id)
                ->whereIn('status', ['draft', 'processed'])
                ->get();

            foreach ($payrolls as $payroll) {
                $payroll->update([
                    'total' => $this->calculateTotal($payroll->fresh()),
                ]);
            }

            return $insurance->fresh();
        });
    }

    /**
     * Recalculate net payroll total — mirrors PayrollController::calculateTotal().
     */
    private function calculateTotal(Payroll $payroll): float
    {
        $base        = $payroll->baseSalary?->salary ?? 0;
        $insurance   = $payroll->insurance?->cost ?? 0;
        $taxRate     = $payroll->tax?->rate ?? 0;
        $taxAmount   = $base * ($taxRate / 100);
        $dailyRate   = $base / 22;
        $leaveDeduct = $payroll->extra_leaves * $dailyRate;
        $overtimePay = $payroll->overtime_hours * ($base / 160) * $payroll->overtime_rate;

        return round(
            $base
                - $insurance
                - $taxAmount
                - $leaveDeduct
                - $payroll->deductions
                + $payroll->bonus
                + $payroll->allowances
                + $overtimePay,
            2
        );
    }
}
