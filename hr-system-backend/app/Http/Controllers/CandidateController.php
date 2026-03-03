<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CandidateController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $candidates = Candidate::withCount('applications')
            ->orderByDesc('created_at')
            ->get();

        return $this->success($candidates);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:candidates,email|max:255',
            'phone'       => 'required|string|max:20',
            'resume_path' => 'nullable|string|max:500',
        ]);

        $candidate = Candidate::create($data);

        return $this->created($candidate, 'Candidate created successfully.');
    }

    public function show(Candidate $candidate)
    {
        $candidate->load('applications.jobOpening:id,title,department');

        return $this->success($candidate);
    }

    public function update(Request $request, Candidate $candidate)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'email'       => 'sometimes|email|unique:candidates,email,' . $candidate->id . '|max:255',
            'phone'       => 'sometimes|string|max:20',
            'resume_path' => 'nullable|string|max:500',
        ]);

        $candidate->update($data);

        return $this->success($candidate, 'Candidate updated successfully.');
    }

    public function destroy(Candidate $candidate)
    {
        $candidate->delete();

        return $this->success(null, 'Candidate deleted successfully.');
    }
}
