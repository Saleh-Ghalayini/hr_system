<?php

namespace App\Http\Controllers;

use App\Models\Insurance;
use App\Services\InsuranceService;
use App\Traits\ApiResponse;
use App\Http\Requests\Insurance\UpdateInsurancePlanRequest;

class InsuranceController extends Controller
{
    use ApiResponse;

    public function __construct(private InsuranceService $insuranceService) {}

    public function getInsurances()
    {
        return $this->success(Insurance::all());
    }

    public function updatePlan(UpdateInsurancePlanRequest $request, Insurance $insurance)
    {
        $updated = $this->insuranceService->updatePlan($insurance, (float) $request->validated()['value']);

        return $this->success($updated, 'Insurance plan updated successfully.');
    }
}
