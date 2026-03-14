<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Traits\ApiResponse;
use App\Http\Requests\Job\CandidateRequest;

class CandidateController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $candidates = Candidate::withCount('applications')
            ->orderByDesc('created_at')
            ->paginate(200);

        return $this->success($candidates);
    }

    public function store(CandidateRequest $request)
    {
        $candidate = Candidate::create($request->validated());

        return $this->created($candidate, 'Candidate created successfully.');
    }

    public function show(Candidate $candidate)
    {
        $candidate->load('applications.jobOpening:id,title,department');

        return $this->success($candidate);
    }

    public function update(CandidateRequest $request, Candidate $candidate)
    {
        $candidate->update($request->validated());

        return $this->success($candidate, 'Candidate updated successfully.');
    }

    public function destroy(Candidate $candidate)
    {
        $candidate->delete();

        return $this->success(null, 'Candidate deleted successfully.');
    }
}
