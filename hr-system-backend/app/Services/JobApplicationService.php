<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\JobOpening;
use App\Models\JobApplication;
use Illuminate\Support\Facades\DB;

class JobApplicationService
{
    public function apply(JobOpening $jobOpening, array $data): JobApplication
    {
        return DB::transaction(function () use ($jobOpening, $data) {
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

            return JobApplication::create([
                'candidate_id'   => $candidate->id,
                'job_opening_id' => $jobOpening->id,
                'status'         => 'pending',
                'notes'          => $data['notes'] ?? null,
            ]);
        });
    }
}
