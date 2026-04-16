<?php

namespace App\Observers;

use App\Models\Tax;
use App\Models\Payroll;
use Illuminate\Support\Facades\Log;

/**
 * When a tax record's rate changes, recalculate all non-paid payrolls
 * that reference it.
 */
class TaxObserver
{
    public function updated(Tax $tax): void
    {
        if ($tax->wasChanged('rate')) {
            try {
                $payrolls = Payroll::where('tax_id', $tax->id)
                    ->whereIn('status', ['draft', 'processed'])
                    ->get();

                foreach ($payrolls as $payroll) {
                    $payroll->update([
                        'total' => $this->recalculateTotal($payroll->fresh()),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('TaxObserver: failed to recalculate payrolls for tax ' . $tax->id, [
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
