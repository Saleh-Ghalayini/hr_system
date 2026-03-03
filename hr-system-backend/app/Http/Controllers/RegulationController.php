<?php

namespace App\Http\Controllers;

use App\Models\Regulation;
use App\Models\RegulationRequirement;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

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

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'category'    => 'nullable|string|max:100',
        ]);

        $regulation = Regulation::create($data);

        return $this->created($regulation, 'Regulation created successfully.');
    }

    public function show(Regulation $regulation)
    {
        $regulation->load('requirements.responsibleUser:id,first_name,last_name');

        return $this->success($regulation);
    }

    public function update(Request $request, Regulation $regulation)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category'    => 'nullable|string|max:100',
        ]);

        $regulation->update($data);

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

    public function storeRequirement(Request $request, Regulation $regulation)
    {
        $data = $request->validate([
            'description'       => 'required|string',
            'responsible_party' => 'nullable|exists:users,id',
            'due_date'          => 'nullable|date',
            'status'            => 'sometimes|in:pending,in_progress,completed',
        ]);

        $data['regulation_id'] = $regulation->id;
        $requirement = RegulationRequirement::create($data);

        return $this->created($requirement, 'Requirement added successfully.');
    }

    public function updateRequirement(Request $request, Regulation $regulation, RegulationRequirement $requirement)
    {
        $data = $request->validate([
            'description'       => 'sometimes|string',
            'responsible_party' => 'nullable|exists:users,id',
            'due_date'          => 'nullable|date',
            'status'            => 'sometimes|in:pending,in_progress,completed',
        ]);

        $requirement->update($data);

        return $this->success($requirement, 'Requirement updated successfully.');
    }

    public function destroyRequirement(Regulation $regulation, RegulationRequirement $requirement)
    {
        $requirement->delete();

        return $this->success(null, 'Requirement deleted successfully.');
    }
}
