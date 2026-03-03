<?php

namespace App\Http\Controllers;

use App\Models\JobOpening;
use App\Models\JobApplication;
use App\Services\JobApplicationService;
use App\Traits\ApiResponse;
use App\Http\Requests\Job\ApplyJobRequest;
use App\Http\Requests\Job\UpdateApplicationStatusRequest;

class JobApplicationController extends Controller
{
    use ApiResponse;

    public function __construct(private JobApplicationService $jobApplicationService) {}

    public function apply(ApplyJobRequest $request, JobOpening $jobOpening)
    {
        if ($jobOpening->status !== 'open') {
            return $this->error('This position is no longer accepting applications.', 422);
        }

        $this->jobApplicationService->apply($jobOpening, $request->validated());

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

    public function updateStatus(UpdateApplicationStatusRequest $request, JobApplication $application)
    {
        $application->update($request->validated());

        return $this->success($application, 'Application status updated.');
    }
}
