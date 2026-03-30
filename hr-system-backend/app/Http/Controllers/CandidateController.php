<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Traits\ApiResponse;
use App\Http\Requests\Job\CandidateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CandidateController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $candidates = Candidate::withCount('applications')
            ->orderByDesc('created_at')
            ->paginate(20);

        return $this->success($candidates);
    }

    public function store(CandidateRequest $request)
    {
        $data = $request->validated();

        // Handle CV upload on create
        if ($request->hasFile('cv')) {
            $data['cv_path'] = $request->file('cv')->store('cvs', 'public');
        }

        $candidate = Candidate::create($data);

        return $this->created($candidate, 'Candidate created successfully.');
    }

    public function show(Candidate $candidate)
    {
        $candidate->load('applications.jobOpening:id,title,department');
        $candidate->cv_url = $candidate->cv_path
            ? Storage::url($candidate->cv_path)
            : null;

        return $this->success($candidate);
    }

    public function update(CandidateRequest $request, Candidate $candidate)
    {
        $data = $request->validated();

        if ($request->hasFile('cv')) {
            // Delete old CV
            if ($candidate->cv_path) {
                Storage::disk('public')->delete($candidate->cv_path);
            }
            $data['cv_path'] = $request->file('cv')->store('cvs', 'public');
        }

        $candidate->update($data);

        return $this->success($candidate, 'Candidate updated successfully.');
    }

    /** POST /admin/candidates/{candidate}/cv */
    public function uploadCv(Request $request, Candidate $candidate)
    {
        $request->validate([
            'cv' => 'required|file|mimes:pdf,doc,docx|max:5120',
        ]);

        if ($candidate->cv_path) {
            Storage::disk('public')->delete($candidate->cv_path);
        }

        $path = $request->file('cv')->store('cvs', 'public');
        $candidate->update(['cv_path' => $path]);

        return $this->success([
            'cv_path' => $path,
            'cv_url'  => Storage::url($path),
        ], 'CV uploaded successfully.');
    }

    public function destroy(Candidate $candidate)
    {
        if ($candidate->cv_path) {
            Storage::disk('public')->delete($candidate->cv_path);
        }

        $candidate->delete();

        return $this->success(null, 'Candidate deleted successfully.');
    }
}
