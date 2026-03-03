<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\JobOpening;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\JobApplication;
use Illuminate\Support\Facades\DB;

class JobApplicationController extends Controller
{
    use ApiResponse;

    public function apply(Request $request, JobOpening $jobOpening)
    {
        if ($jobOpening->status !== 'open') {
            return $this->error('This position is no longer accepting applications.', 422);
        }

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|max:255',
            'phone'       => 'required|string|max:20',
            'resume_path' => 'nullable|string|max:500',
            'notes'       => 'nullable|string',
        ]);

        DB::transaction(function () use ($data, $jobOpening, &$application) {
            $candidate = Candidate::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'        => $data['name'],
                    'phone'       => $data['phone'],
                    'resume_path' => $data['resume_path'] ?? null,
                ]
            );

            $existing = JobApplication::where('candidate_id', $candidate->id)
                ->where('job_opening_id', $jobOpening->id)
                ->first();

            if ($existing) {
                abort(422, 'You have already applied for this position.');
            }

            $application = JobApplication::create([
                'candidate_id'   => $candidate->id,
                'job_opening_id' => $jobOpening->id,
                'status'         => 'pending',
                'notes'          => $data['notes'] ?? null,
            ]);
        });

        return $this->created(null, 'Application submitted successfully.');
    }

    public function index(JobOpening $jobOpening)
    {
        $applications = $jobOpening->applications()
            ->with('candidate:id,name,email,phone')
            ->orderByDesc('created_at')
            ->get();

        return $this->success($applications);
    }

    public function updateStatus(Request $request, JobApplication $application)
    {
        $data = $request->validate([
            'status'         => 'required|in:pending,reviewed,interviewed,hired,rejected',
            'interview_date' => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        $application->update($data);

        return $this->success($application, 'Application status updated.');
    }
}
