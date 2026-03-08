<?php

namespace App\Services;

use App\Models\Payroll;
use App\Models\Insurance;
use Illuminate\Support\Facades\DB;

class InsuranceService
{
    public function updatePlan(Insurance $insurance, float $newValue): Insurance
    {
        DB::transaction(function () use ($insurance, $newValue) {
            $oldCost = $insurance->cost;
            $delta   = $newValue - $oldCost;

            $insurance->update([
                'old_cost' => $oldCost,
                'cost'     => $newValue,
            ]);

            if ($delta != 0) {
                Payroll::where('insurance_id', $insurance->id)
                    ->increment('total', $delta);
            }
        });

        return $insurance->fresh();
    }
}
