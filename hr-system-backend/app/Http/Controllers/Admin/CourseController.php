<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success(Course::withCount('enrollments')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'course_name'      => 'required|string|max:255',
            'description'      => 'required|string',
            'skills'           => 'nullable|array',
            'duration_hours'   => 'required|integer|min:1',
            'certificate_text' => 'nullable|string|max:1000',
        ]);

        $course = Course::create($data);

        return $this->created($course, 'Course created successfully.');
    }

    public function show(Course $course)
    {
        $course->loadCount('enrollments');

        return $this->success($course);
    }

    public function update(Request $request, Course $course)
    {
        $data = $request->validate([
            'course_name'      => 'sometimes|string|max:255',
            'description'      => 'sometimes|string',
            'skills'           => 'nullable|array',
            'duration_hours'   => 'sometimes|integer|min:1',
            'certificate_text' => 'nullable|string|max:1000',
        ]);

        $course->update($data);

        return $this->success($course, 'Course updated successfully.');
    }

    public function destroy(Course $course)
    {
        if ($course->enrollments()->count() > 0) {
            return $this->error('Cannot delete a course that has active enrollments.', 400);
        }

        $course->delete();

        return $this->success(null, 'Course deleted successfully.');
    }
}
