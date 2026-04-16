<?php

namespace App\Observers;

use App\Models\Insurance;
use App\Models\Payroll;
use Illuminate\Support\Facades\Log;

/**
 * When an insurance plan's cost changes, recalculate all non-paid payrolls
 * that reference it.
 */
class InsuranceObserver
{
    public function updated(Insurance $insurance): void
    {
        if ($insurance->wasChanged('cost')) {
            try {
                $payrolls = Payroll::where('insurance_id', $insurance->id)
                    ->whereIn('status', ['draft', 'processed'])
                    ->get();

                foreach ($payrolls as $payroll) {
                    $payroll->update([
                        'total' => $this->recalculateTotal($payroll->fresh()),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('InsuranceObserver: failed to recalculate payrolls for insurance ' . $insurance->id, [
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Recalculate total for an existing payroll record.
     * Same logic as PayrollController::calculateTotal().
     */
    private function recalculateTotal(Payroll $payroll): float
    {
        $base        = $payroll->baseSalary?->salary ?? 0;
        $insurance   = $payroll->insurance?->cost ?? 0;
        $taxRate     = $payroll->tax?->rate ?? 0;
        $taxAmount   = $base * ($taxRate / 100);
        $dailyRate   = $base / 22;
        $leaveDeduct = ($payroll->extra_leaves ?? 0) * $dailyRate;
        $overtimePay = ($payroll->overtime_hours ?? 0) * ($base / 160) * ($payroll->overtime_rate ?? 1.5);

        return round(
            $base
                - $insurance
                - $taxAmount
                - $leaveDeduct
                - ($payroll->deductions ?? 0)
                + ($payroll->bonus ?? 0)
                + ($payroll->allowances ?? 0)
                + $overtimePay,
            2
        );
    }
}
