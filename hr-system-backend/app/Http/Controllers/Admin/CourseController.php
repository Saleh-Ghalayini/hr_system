<?php

namespace App\Http\Controllers\Admin;

use App\Models\Course;
use App\Traits\ApiResponse;
use App\Http\Requests\Course\CourseRequest;
use App\Http\Controllers\Controller;

class CourseController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success(Course::withCount('enrollments')->paginate(200));
    }

    public function store(CourseRequest $request)
    {
        $course = Course::create($request->validated());

        return $this->created($course, 'Course created successfully.');
    }

    public function show(Course $course)
    {
        $course->loadCount('enrollments');

        return $this->success($course);
    }

    public function update(CourseRequest $request, Course $course)
    {
        $course->update($request->validated());

        return $this->success($course, 'Course updated successfully.');
    }

    public function destroy(Course $course)
    {
        if ($course->enrollments()->count() > 0) {
            return $this->error('Cannot delete a course that has enrollments.', 400);
        }

        $course->delete();

        return $this->success(null, 'Course deleted successfully.');
    }
}
