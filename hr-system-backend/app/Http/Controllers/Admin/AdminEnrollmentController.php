<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminEnrollmentController extends Controller
{
    public function index()
    {
        // if(Auth::user()->role != "admin"){
        //     return response()->json([
        //         'status' => 'error',
        //         'message' => 'Unauthorized'
        //     ], 401);
        // }
        return Enrollment::with(['user', 'course'])->get();
    }

    public function store(Request $request)
    {
        try {
            // Check if user is already enrolled in this course
            $existingEnrollment = Enrollment::where('user_id', $request->user_id)
                ->where('course_id', $request->course_id)
                ->first();

            if ($existingEnrollment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User is already enrolled in this course'
                ], 400);
            }

            $enrollment = new Enrollment();
            $enrollment->user_id = $request->user_id;
            $enrollment->course_id = $request->course_id;
            $enrollment->end_date = $request->end_date;
            $enrollment->status = $request->status;
            $enrollment->start_date = $request->start_date;

            $enrollment->save();

            // Get only specific fields without relations
            $enrollmentData = Enrollment::select('id', 'user_id', 'course_id', 'start_date', 'end_date', 'status')
                ->where('id', $enrollment->id)
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Enrollment created successfully',
                'enrollment' => $enrollmentData
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateEnrollment(Request $request, Enrollment $enrollment)      
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

            // Check if user_id and course_id combination exists in any enrollment
            if ($request->has('user_id') && $request->has('course_id')) {
                $existingEnrollment = Enrollment::where('user_id', $request->user_id)
                    ->where('course_id', $request->course_id)
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

    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();
        return response()->noContent();
    }
}
