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
                // Only fetch counts for large tables - not full records
                'stats' => [
                    'total_users' => User::count(),
                    'active_employees' => User::whereHas('jobDetail', fn($q) => $q->where('employment_status', 'active'))->count(),
                    'pending_leaves' => LeaveRequest::where('status', 'pending')->count(),
                    'total_courses' => Course::count(),
                    'active_enrollments' => Enrollment::whereIn('status', ['enrolled', 'in_progress'])->count(),
                    'today_checked_in' => Attendance::whereDate('date', $today)->count(),
                    'payroll_this_month' => Payroll::where('month', $thisMonth)->count(),
                ],

                // Only fetch latest few records for preview
                'recent_leaves' => LeaveRequest::with('user:id,first_name,last_name')
                    ->orderByDesc('created_at')
                    ->limit(10)
                    ->get(['id', 'user_id', 'leave_type', 'status', 'start_date', 'end_date']),

                'recent_courses' => Course::withCount('enrollments')
                    ->select('id', 'course_name', 'duration_hours')
                    ->orderByDesc('created_at')
                    ->limit(10)
                    ->get(),

                'recent_enrollments' => Enrollment::with(['user:id,first_name,last_name', 'course:id,course_name'])
                    ->orderByDesc('created_at')
                    ->limit(10)
                    ->get(['id', 'user_id', 'course_id', 'status', 'created_at']),

                'attendance_today' => Attendance::whereDate('date', $today)
                    ->select('id', 'user_id', 'full_name', 'date', 'check_in', 'check_out', 'time_in_status')
                    ->limit(50)
                    ->get(),

                'attendance_trend' => Attendance::whereBetween('date', [$trendStart, $today])
                    ->selectRaw('date, time_in_status, COUNT(*) as count')
                    ->groupBy('date', 'time_in_status')
                    ->orderBy('date')
                    ->get(),

                'recent_payroll' => Payroll::with('user:id,first_name,last_name')
                    ->where('month', $thisMonth)
                    ->limit(10)
                    ->get(['id', 'user_id', 'fullname', 'month', 'total']),
            ];
        });

        return $this->success($data);
    }
}
