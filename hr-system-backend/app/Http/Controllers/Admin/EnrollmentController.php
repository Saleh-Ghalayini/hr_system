<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class EnrollmentController extends Controller
{
    public function update(Request $request, Enrollment $enrollment)
    {
        try {
            // Check if enrollment exists
            if (!$enrollment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Enrollment not found'
                ], 404);
            }

            // Check if user exists
            if ($request->has('user_id')) {
                $user = User::find($request->user_id);
                if (!$user) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'User not found'
                    ], 404);
                }
            }

            // Check if course exists
            if ($request->has('course_id')) {
                $course = Course::find($request->course_id);
                if (!$course) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Course not found'
                    ], 404);
                }
            }

            // Check for duplicate enrollment if user_id or course_id is being updated
            if ($request->has('user_id') || $request->has('course_id')) {
                $existingEnrollment = Enrollment::where('user_id', $request->user_id ?? $enrollment->user_id)
                    ->where('course_id', $request->course_id ?? $enrollment->course_id)
                    ->where('id', '!=', $enrollment->id)
                    ->first();

                if ($existingEnrollment) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'User is already enrolled in this course'
                    ], 400);
                }
            }

            $enrollment->update($request->all());
            return response()->json([
                'status' => 'success',
                'message' => 'Enrollment updated successfully',
                'enrollment' => $enrollment
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
