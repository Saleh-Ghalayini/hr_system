<?php

namespace App\Http\Controllers\User;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    use ApiResponse;

    public function userCourses(Request $request, $user_id)
    {
        $user = User::find($user_id);

        if (!$user) {
            return $this->notFound('User not found.');
        }

        $enrollments = $user->enrollments()
            ->with('course:id,course_name,description,duration_hours,certificate_text')
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->get();

        return $this->success([
            'user'        => $user->only(['id', 'first_name', 'last_name']),
            'enrollments' => $enrollments,
            'total'       => $enrollments->count(),
            'completed'   => $enrollments->where('status', 'completed')->count(),
        ]);
    }
}
