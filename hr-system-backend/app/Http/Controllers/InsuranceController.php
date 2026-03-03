<?php

namespace App\Http\Controllers;

use App\Models\Insurance;
use App\Models\Payroll;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InsuranceController extends Controller
{
    use ApiResponse;

    public function getInsurances()
    {
        return $this->success(Insurance::all());
    }

    public function updatePlan(Request $request, Insurance $insurance)
    {
        $data = $request->validate([
            'value' => 'required|numeric|min:0|max:100000',
        ]);

        DB::transaction(function () use ($insurance, $data) {
            $oldCost = $insurance->cost;
            $newCost = (float) $data['value'];
            $delta   = $oldCost - $newCost;

            $insurance->update([
                'old_cost' => $oldCost,
                'cost'     => $newCost,
            ]);

            if ($delta != 0) {
                Payroll::where('insurance_id', $insurance->id)
                    ->increment('total', $delta);
            }
        });

        return $this->success($insurance->fresh(), 'Insurance plan updated successfully.');
    }
}
