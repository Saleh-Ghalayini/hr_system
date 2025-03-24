<?php
namespace App\Http\Controllers\User;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function userCourses($user_id)
    {
        dd("hello");
        $user = User::find($user_id);
        $courses = $user->courses;

        return response()->json([
            'status' => 'success',
            'data' => $courses,
            'meta' => [
                'total_enrollments' => $courses->count(),
                'completed' => $courses->where('pivot.status', 'completed')->count()
            ]
        ]);
    }

    public function enrollments()
    {
        dd(Auth::user());
        $enrollments = Auth::user()->enrollments()
        ->with('course')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Enrollment $enrollment) {
                return [
                    'id' => $enrollment->id,
                    'course_name' => $enrollment->course->course_name,
                    'start_date' => $enrollment->start_date,
                    'end_date' => $enrollment->end_date,
                    'status' => $enrollment->status,
                    'progress' => $this->calculateProgress($enrollment->status),
                    'certificate_eligible' => $enrollment->status === 'completed'
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $enrollments,
            'meta' => [
                'total_enrollments' => $enrollments->count()
            ]
        ]);
    }

    // public function userCourses(User $user)
    // {
    //     $courses = $user->courses()
    //         ->when(request('status'), function($query) {
    //             $query->wherePivot('status', request('status'));
    //         })
    //         ->orderByPivot('created_at', 'desc')
    //         ->get();

    //     return response()->json([
    //         'status' => 'success',
    //         'data' => [
    //             'user' => $user->only(['id', 'name', 'email']),
    //             'enrollments' => $courses->map(function($course) {
    //                 return [
    //                     'enrollment_id' => $course->pivot->id,
    //                     'course_id' => $course->id,
    //                     'title' => $course->title,
    //                     'status' => $course->pivot->status,
    //                     'due_date' => $course->pivot->due_date,
    //                     'enrolled_at' => $course->pivot->created_at,
    //                     'progress' => $this->calculateProgress($course->pivot->status)
    //                 ];
    //             })
    //         ],
    //         'meta' => [
    //             'total_enrollments' => $courses->count(),
    //             'completed' => $courses->where('pivot.status', 'completed')->count()
    //         ]
    //     ]);
    // }

    private function calculateProgress($status)
    {
        return match ($status) {
            'completed' => 100,
            'in_progress' => 50,
            'terminated' => 0,
            default => 25,
        };
    }
}
