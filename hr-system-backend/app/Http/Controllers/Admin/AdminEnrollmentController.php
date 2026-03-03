<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AdminEnrollmentController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $enrollments = Enrollment::with([
            'user:id,first_name,last_name,email',
            'course:id,course_name,duration_hours',
        ])->orderByDesc('created_at')->get();

        return $this->success($enrollments);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'    => 'required|exists:users,id',
            'course_id'  => 'required|exists:courses,id',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'status'     => 'sometimes|in:enrolled,in_progress,completed,terminated',
        ]);

        $existing = Enrollment::where('user_id', $data['user_id'])
            ->where('course_id', $data['course_id'])
            ->whereNotIn('status', ['terminated'])
            ->first();

        if ($existing) {
            return $this->error('User is already enrolled in this course.', 400);
        }

        $enrollment = Enrollment::create($data);

        return $this->created(
            $enrollment->load('user:id,first_name,last_name', 'course:id,course_name'),
            'Enrollment created successfully.'
        );
    }

    public function updateEnrollment(Request $request, Enrollment $enrollment)
    {
        $data = $request->validate([
            'user_id'    => 'sometimes|exists:users,id',
            'course_id'  => 'sometimes|exists:courses,id',
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|date|after_or_equal:start_date',
            'status'     => 'sometimes|in:enrolled,in_progress,completed,terminated',
        ]);

        // Check duplicate if user/course is being changed
        if (isset($data['user_id']) || isset($data['course_id'])) {
            $userId   = $data['user_id']   ?? $enrollment->user_id;
            $courseId = $data['course_id'] ?? $enrollment->course_id;

            $duplicate = Enrollment::where('user_id', $userId)
                ->where('course_id', $courseId)
                ->where('id', '!=', $enrollment->id)
                ->whereNotIn('status', ['terminated'])
                ->first();

            if ($duplicate) {
                return $this->error('User is already enrolled in this course.', 400);
            }
        }

        $enrollment->update($data);

        return $this->success($enrollment, 'Enrollment updated successfully.');
    }

    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();

        return $this->success(null, 'Enrollment deleted successfully.');
    }
}
