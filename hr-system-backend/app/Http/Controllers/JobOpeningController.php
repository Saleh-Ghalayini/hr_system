<?php

namespace App\Http\Controllers;

use App\Models\JobOpening;
use App\Traits\ApiResponse;
use App\Http\Requests\Job\JobOpeningRequest;
use Illuminate\Support\Facades\Auth;

class JobOpeningController extends Controller
{
    use ApiResponse;

    public function publicIndex()
    {
        $openings = JobOpening::where('status', 'open')
            ->select('id', 'title', 'department', 'description', 'created_at')
            ->orderByDesc('created_at')
            ->get();

        return $this->success($openings);
    }

    public function index()
    {
        $openings = JobOpening::withCount('applications')
            ->with('postedBy:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->paginate(200);

        return $this->success($openings);
    }

    public function store(JobOpeningRequest $request)
    {
        $data              = $request->validated();
        $data['posted_by'] = Auth::id();
        $opening           = JobOpening::create($data);

        return $this->created($opening, 'Job opening created successfully.');
    }

    public function show(JobOpening $jobOpening)
    {
        $jobOpening->load('postedBy:id,first_name,last_name', 'applications');

        return $this->success($jobOpening);
    }

    public function update(JobOpeningRequest $request, JobOpening $jobOpening)
    {
        $jobOpening->update($request->validated());

        return $this->success($jobOpening, 'Job opening updated successfully.');
    }

    public function destroy(JobOpening $jobOpening)
    {
        $jobOpening->delete();

        return $this->success(null, 'Job opening deleted successfully.');
    }
}
