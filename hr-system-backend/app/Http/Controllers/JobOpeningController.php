<?php

namespace App\Http\Controllers;

use App\Models\JobOpening;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
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
            ->get();

        return $this->success($openings);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'department'  => 'required|string|max:255',
            'description' => 'required|string',
            'status'      => 'sometimes|in:open,closed,on_hold',
        ]);

        $data['posted_by'] = Auth::id();
        $opening = JobOpening::create($data);

        return $this->created($opening, 'Job opening created successfully.');
    }

    public function show(JobOpening $jobOpening)
    {
        $jobOpening->load('postedBy:id,first_name,last_name', 'applications');

        return $this->success($jobOpening);
    }

    public function update(Request $request, JobOpening $jobOpening)
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'department'  => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status'      => 'sometimes|in:open,closed,on_hold',
        ]);

        $jobOpening->update($data);

        return $this->success($jobOpening, 'Job opening updated successfully.');
    }

    public function destroy(JobOpening $jobOpening)
    {
        $jobOpening->delete();

        return $this->success(null, 'Job opening deleted successfully.');
    }
}
