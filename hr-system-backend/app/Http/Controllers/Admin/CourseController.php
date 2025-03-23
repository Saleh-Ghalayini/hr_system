<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    public function index()
    {
        // dd("hello");
        return Course::all();
    }

    public function store(Request $request)
    {
     try{
     $course = new Course();
     //sample json data for creating new course is 
     $course->course_name = $request->course_name;
     $course->description = $request->description;
     $course->skills = $request->skills;
     $course->duration_hours = $request->duration_hours;
     $course->certificate_text = $request->certificate_text;
     $course->save();
     return response()->json([
        'status' => 'success',
        'message' => 'Course created successfully',
        'course' => $course
    ], 201);

    }catch(ValidationException $e){
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 422);
     }
    }

    public function update(Request $request, Course $course)
    {
        $data = $request->validate([
            'course_name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'skills' => 'sometimes|json',
            'duration_hours' => 'sometimes|integer|min:1',
            'certificate_text' => 'nullable|string'
        ]);

        $course->update($data);
        return $course;
    }

    public function destroy($course_id)
    {
        try {
            $course = Course::findOrFail($course_id);

            if ($course->enrollments->count() > 0 || $course->id == 1) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Course has enrollments'
                ], 400);
            }
            
            $course->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Course deleted successfully'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Course not found'
            ], 404);
        }
    }
}
