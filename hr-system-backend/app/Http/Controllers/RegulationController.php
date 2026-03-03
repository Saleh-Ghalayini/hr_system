<?php

namespace App\Http\Controllers;

use App\Models\Regulation;
use App\Traits\ApiResponse;
use App\Http\Requests\Regulation\RegulationRequest;
use App\Http\Requests\Regulation\RequirementRequest;
use App\Models\RegulationRequirement;

class RegulationController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $regulations = Regulation::withCount('requirements')
            ->orderByDesc('created_at')
            ->get();

        return $this->success($regulations);
    }

    public function store(RegulationRequest $request)
    {
        $regulation = Regulation::create($request->validated());

        return $this->created($regulation, 'Regulation created successfully.');
    }

    public function show(Regulation $regulation)
    {
        $regulation->load('requirements.responsibleUser:id,first_name,last_name');

        return $this->success($regulation);
    }

    public function update(RegulationRequest $request, Regulation $regulation)
    {
        $regulation->update($request->validated());

        return $this->success($regulation, 'Regulation updated successfully.');
    }

    public function destroy(Regulation $regulation)
    {
        $regulation->delete();

        return $this->success(null, 'Regulation deleted successfully.');
    }

    public function requirements(Regulation $regulation)
    {
        $requirements = $regulation->requirements()
            ->with('responsibleUser:id,first_name,last_name')
            ->get();

        return $this->success($requirements);
    }

    public function storeRequirement(RequirementRequest $request, Regulation $regulation)
    {
        $data                  = $request->validated();
        $data['regulation_id'] = $regulation->id;
        $requirement           = RegulationRequirement::create($data);

        return $this->created($requirement, 'Requirement added successfully.');
    }

    public function updateRequirement(RequirementRequest $request, Regulation $regulation, RegulationRequirement $requirement)
    {
        $requirement->update($request->validated());

        return $this->success($requirement, 'Requirement updated successfully.');
    }

    public function destroyRequirement(Regulation $regulation, RegulationRequirement $requirement)
    {
        $requirement->delete();

        return $this->success(null, 'Requirement deleted successfully.');
    }
}
