<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Payroll;
use App\Models\BaseSalary;
use App\Models\Tax;
use App\Models\LeaveBalance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    public function created(User $user): void
    {
        try {
            DB::transaction(function () use ($user) {
                $baseSalary = BaseSalary::where('position', $user->position)->first();
                $defaultTax = Tax::first();

                $initialTotal = $this->calculateInitialTotal(
                    $baseSalary,
                    $user->insurance,
                    $defaultTax
                );

                Payroll::create([
                    'user_id'        => $user->id,
                    'fullname'       => trim($user->first_name . ' ' . $user->last_name),
                    'position'       => $user->position,
                    'base_salary_id' => $baseSalary?->id,
                    'insurance_id'   => $user->insurance_id,
                    'tax_id'         => $defaultTax?->id,
                    'extra_leaves'   => 0,
                    'overtime_hours' => 0,
                    'overtime_rate'  => 1.5,
                    'bonus'          => 0,
                    'allowances'     => 0,
                    'deductions'     => 0,
                    'notes'          => null,
                    'status'         => 'draft',
                    'month'          => now()->format('Y-m'),
                    'total'          => $initialTotal,
                ]);

                LeaveBalance::create([
                    'user_id'  => $user->id,
                    'balances' => [
                        'annual'  => 15,
                        'sick'    => 15,
                        'pto'     => 10,
                        'maternity' => 60,
                        'paternity' => 30,
                    ],
                ]);
            });
        } catch (\Throwable $e) {
            Log::error('UserObserver: failed to create payroll/leave balance for user ' . $user->id, [
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function updated(User $user): void
    {
        // If the user's position changed, update ALL their payroll records
        if ($user->wasChanged('position')) {
            try {
                $baseSalary = BaseSalary::where('position', $user->position)->first();

                // Update all non-paid payroll records for this user
                $payrolls = $user->payrolls()
                    ->whereIn('status', ['draft', 'processed'])
                    ->get();

                foreach ($payrolls as $payroll) {
                    $payroll->update([
                        'position'       => $user->position,
                        'base_salary_id' => $baseSalary?->id,
                        'total'          => $this->recalculateTotal($payroll->fresh()),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('UserObserver: failed to update payroll for user ' . $user->id, [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // If insurance changed, recalculate all non-paid payrolls
        if ($user->wasChanged('insurance_id')) {
            try {
                $payrolls = $user->payrolls()
                    ->whereIn('status', ['draft', 'processed'])
                    ->get();

                foreach ($payrolls as $payroll) {
                    $payroll->update([
                        'insurance_id' => $user->insurance_id,
                        'total'        => $this->recalculateTotal($payroll->fresh()),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('UserObserver: failed to recalculate payroll for user ' . $user->id, [
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Calculate initial total for a new payroll record.
     */
    private function calculateInitialTotal(?BaseSalary $baseSalary, $insurance, ?Tax $tax): float
    {
        $base      = $baseSalary?->salary ?? 0;
        $insCost   = $insurance?->cost ?? 0;
        $taxRate   = $tax?->rate ?? 0;
        $taxAmount = $base * ($taxRate / 100);

        return round($base - $insCost - $taxAmount, 2);
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

    public function deleted(User $user): void
    {
        // Cancel all pending leave requests when a user is soft-deleted
        $user->leaveRequests()
            ->where('status', 'pending')
            ->update(['status' => 'rejected']);

        // Terminate active enrollments
        $user->enrollments()
            ->whereIn('status', ['enrolled', 'in_progress'])
            ->update(['status' => 'terminated']);
    }

    public function restored(User $user): void
    {
        //
    }

    public function forceDeleted(User $user): void
    {
        //
    }
}
