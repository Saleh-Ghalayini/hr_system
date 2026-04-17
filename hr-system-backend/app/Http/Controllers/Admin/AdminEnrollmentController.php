<?php

namespace App\Http\Controllers\Admin;

use App\Models\Enrollment;
use App\Services\EnrollmentService;
use App\Traits\ApiResponse;
use App\Http\Requests\Enrollment\StoreEnrollmentRequest;
use App\Http\Requests\Enrollment\UpdateEnrollmentRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AdminEnrollmentController extends Controller
{
    use ApiResponse;

    public function __construct(private EnrollmentService $enrollmentService) {}

    public function index(Request $request)
    {
        $query = Enrollment::with([
            'user:id,first_name,last_name,email',
            'course:id,course_name,duration_hours',
        ])->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($courseId = $request->query('course_id')) {
            $query->where('course_id', $courseId);
        }

        return $this->success($query->paginate(50));
    }

    public function store(StoreEnrollmentRequest $request)
    {
        $enrollment = $this->enrollmentService->store($request->validated());

        return $this->created(
            $enrollment->load('user:id,first_name,last_name', 'course:id,course_name'),
            'Enrollment created successfully.'
        );
    }

    public function updateEnrollment(UpdateEnrollmentRequest $request, Enrollment $enrollment)
    {
        $updated = $this->enrollmentService->update($enrollment, $request->validated());

        return $this->success($updated, 'Enrollment updated successfully.');
    }

    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();

        return $this->success(null, 'Enrollment deleted successfully.');
    }
}
