<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\LeaveRequest;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Attendance;
use App\Models\Payroll;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    use ApiResponse;

    public function summary()
    {
        $today      = now()->toDateString();
        $trendStart = now()->subDays(34)->toDateString();
        $thisMonth  = now()->format('F Y');

        // Cache key includes today's date so it auto-invalidates at midnight
        $cacheKey = 'dashboard_summary_' . $today;

        $data = Cache::remember($cacheKey, 120, function () use ($today, $trendStart, $thisMonth) {
            return [
                'users' => User::select('id', 'first_name', 'last_name', 'email', 'position', 'gender', 'role', 'created_at')
                    ->get(),

                'leaves' => LeaveRequest::select('id', 'user_id', 'leave_type', 'status', 'start_date', 'end_date')
                    ->get(),

                'courses' => Course::withCount('enrollments')
                    ->select('id', 'course_name', 'duration_hours')
                    ->get(),

                'enrollments' => Enrollment::select('id', 'user_id', 'course_id', 'status')
                    ->get(),

                'attendance_today' => Attendance::whereDate('date', $today)
                    ->select('id', 'user_id', 'full_name', 'date', 'check_in', 'check_out', 'time_in_status')
                    ->get(),

                'attendance_trend' => Attendance::whereBetween('date', [$trendStart, $today])
                    ->select('id', 'date', 'time_in_status')
                    ->get(),

                'payroll' => Payroll::select('id', 'user_id', 'fullname', 'month', 'total')
                    ->where('month', $thisMonth)
                    ->get(),
            ];
        });

        return $this->success($data);
    }
}
