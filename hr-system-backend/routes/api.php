<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\InsuranceController;
use App\Http\Controllers\JobOpeningController;
use App\Http\Controllers\RegulationController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\LeaveBalanceController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\LeaveSettingController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\Admin\AdminEnrollmentController;
use App\Http\Controllers\User\UserController as AdminUserController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\AttendanceSettingController;
use App\Http\Controllers\TaxController;

Route::get('/health', fn() => response()->json(['status' => 'ok', 'timestamp' => now()->toIso8601String()]));

Route::prefix('v1')->group(function () {

    // ─────────────────────────────────────────────────────────────────
    // GUEST (unauthenticated)
    // ─────────────────────────────────────────────────────────────────
    Route::prefix('guest')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
        Route::post('/register', [AuthController::class, 'addUser']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');

        // Candidates can view open positions and apply without an account
        Route::get('/job-openings', [JobOpeningController::class, 'publicIndex']);
        Route::post('/job-openings/{jobOpening}/apply', [JobApplicationController::class, 'apply']);
    });

    // ─────────────────────────────────────────────────────────────────
    // AUTHENTICATED (any role)
    // ─────────────────────────────────────────────────────────────────
    Route::middleware('auth:api')->group(function () {

        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/validate-token', [AuthController::class, 'validateToken']);
        Route::get('/directory/users', [AuthController::class, 'getDirectoryUsers']);

        // Profile (read-only for non-admins)
        Route::put('/profile/job-details', [UserController::class, 'updateJobDetails']);
        Route::get('/profile/job-details', [UserController::class, 'getUserJobDetails']);
        Route::put('/profile/basic-info', [UserController::class, 'updateUserBasicInfo']);

        // Attendance (own)
        Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
        Route::get('/attendance/my', [AttendanceController::class, 'getMyAttendance']);
        Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);

        // Leave (own)
        Route::post('/leave/requests', [LeaveRequestController::class, 'leaveRequest']);
        Route::get('/leave/balance', [LeaveBalanceController::class, 'getLeaveBalanceForUser']);
        Route::get('/leave/requests', [LeaveRequestController::class, 'getLeaveRequestsByUser']);

        // Payroll (own)
        Route::get('/profile/payroll', [PayrollController::class, 'getMyPayroll']);
        Route::get('/profile/payroll/history', [PayrollController::class, 'getMyPayrollHistory']);

        // Enrollments (own)
        Route::get('/enrollments/my', [UserController::class, 'enrollments']);
        Route::patch('/enrollments/{enrollment}/progress', [UserController::class, 'updateMyEnrollmentProgress']);

        // Messages (all authenticated users)

        // Announcements (read — all roles)
        Route::get('/announcements', [AnnouncementController::class, 'index']);

        // Holidays (read — all roles)
        Route::get('/holidays', [HolidayController::class, 'index']);

        // Performance (self-rate team, view own ratings)
        Route::get('/performance/types', [PerformanceController::class, 'getTypes']);
        Route::get('/performance/cycles', [PerformanceController::class, 'getCycles']);
        Route::get('/performance/cycles/active', [PerformanceController::class, 'getActiveCycle']);
        Route::post('/performance/rate-team', [PerformanceController::class, 'rateTeam']);
        Route::get('/performance/my-rate', [PerformanceController::class, 'getEmployeRate']);
        Route::get('/performance/my-team-rate', [PerformanceController::class, 'getLastTeamRate']);

        // Self Assessment
        Route::post('/performance/self-assessment', [PerformanceController::class, 'submitSelfAssessment']);
        Route::get('/performance/self-assessment', [PerformanceController::class, 'getSelfAssessment']);

        // Peer Reviews (360-degree feedback)
        Route::post('/performance/peer-review', [PerformanceController::class, 'submitPeerReview']);
        Route::get('/performance/peer-reviews/received', [PerformanceController::class, 'getPeerReviewsReceived']);
        Route::get('/performance/peer-reviews/given', [PerformanceController::class, 'getPeerReviewsGiven']);
        Route::get('/performance/peers', [PerformanceController::class, 'getPotentialPeers']);

        // Goals
        Route::post('/performance/goals', [PerformanceController::class, 'createGoal']);
        Route::get('/performance/goals', [PerformanceController::class, 'getGoals']);
        Route::put('/performance/goals/{id}/progress', [PerformanceController::class, 'updateGoalProgress']);
        Route::delete('/performance/goals/{id}', [PerformanceController::class, 'deleteGoal']);

        // Performance Report & Summary
        Route::get('/performance/report', [PerformanceController::class, 'getReport']);
        Route::get('/performance/summary', [PerformanceController::class, 'getSummary']);

        // ─────────────────────────────────────────────────────────────
        // MANAGER + ADMIN
        // ─────────────────────────────────────────────────────────────
        Route::middleware('ManagerMiddleware')->group(function () {

            // Team attendance
            Route::get('/attendance/team', [AttendanceController::class, 'getUserAttendance']);

            // Rate employees (managers rate their reports)
            Route::get('/performance/average', [PerformanceController::class, 'getAverageRate']);
            Route::post('/performance/rate-employee', [PerformanceController::class, 'rateEmployee']);

            // Department overview
            Route::get('/performance/department-overview', [PerformanceController::class, 'getDepartmentOverview']);

            // Leave approval
            Route::put('/leave/requests/{leaveRequest}', [LeaveRequestController::class, 'updateLeaveRequest']);

            // Payroll (manager/admin view)
            Route::get('/payroll', [PayrollController::class, 'getPayrolls']);

            // Tasks & Projects (managers can manage)
            Route::apiResource('tasks', TaskController::class);
            Route::apiResource('projects', ProjectController::class);
            Route::get('/tasks/{task}/activity', [TaskController::class, 'activityLog']);
        });

        // ─────────────────────────────────────────────────────────────
        // ADMIN ONLY
        // ─────────────────────────────────────────────────────────────
        Route::middleware('AdminMiddleware')->prefix('admin')->group(function () {

            // Dashboard summary (single endpoint for all dashboard data)
            Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

            // Users
            Route::get('/users', [AuthController::class, 'getAllUsers']);
            Route::get('/users/{id}', [AuthController::class, 'getUserById']);
            Route::post('/users', [AdminUserController::class, 'store']);
            Route::put('/users/{user}', [AdminUserController::class, 'update']);
            Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
            Route::get('/users/{user}/courses', [AdminUserController::class, 'userCourses']);

            // User Profile Management (Admin can edit any user)
            Route::get('/users/{id}/profile', [AuthController::class, 'getUserFullProfile']);
            Route::put('/users/{id}/basic-info', [AuthController::class, 'updateUserBasicInfo']);
            Route::put('/users/{id}/job-details', [AuthController::class, 'updateUserJobDetails']);

            // Attendance (full access)
            Route::get('/attendance/search', [AttendanceController::class, 'getUserByName']);
            Route::get('/attendance/all', [AttendanceController::class, 'getAllUsersAttendance']);
            Route::get('/attendance/user/{user_id}', [AttendanceController::class, 'getAttendanceByUserId']);
            Route::put('/attendance/{attendance}/review', [AttendanceController::class, 'reviewLocation']);

            // Leave (full access)
            Route::get('/leave/requests', [LeaveRequestController::class, 'getLeaveRequests']);
            Route::get('/leave/balances', [LeaveBalanceController::class, 'getLeaveBalances']);
            Route::get('/leave/balance/{user}', [LeaveBalanceController::class, 'getLeaveBalanceForUser']);
            Route::get('/leave/balance-by-id/{id}', [LeaveBalanceController::class, 'getLeaveBalanceForUserById']);
            Route::get('/leave/settings', [LeaveSettingController::class, 'index']);
            Route::put('/leave/settings', [LeaveSettingController::class, 'update']);

            // Payroll
            Route::get('/payroll', [PayrollController::class, 'getPayrolls']);
            Route::put('/payroll/{payroll}', [PayrollController::class, 'update']);
            Route::post('/payroll/generate', [PayrollController::class, 'generate']);
            Route::post('/payroll/recalculate/{payroll}', [PayrollController::class, 'recalculate']);

            // Insurance
            Route::get('/insurances', [InsuranceController::class, 'getInsurances']);
            Route::put('/insurances/{insurance}', [InsuranceController::class, 'updatePlan']);

            // Tax
            Route::get('/taxes', [TaxController::class, 'index']);
            Route::put('/taxes/{tax}', [TaxController::class, 'update']);

            // Courses
            Route::apiResource('courses', CourseController::class);

            // Enrollments
            Route::get('/enrollments', [AdminEnrollmentController::class, 'index']);
            Route::post('/enrollments', [AdminEnrollmentController::class, 'store']);
            Route::delete('/enrollments/{enrollment}', [AdminEnrollmentController::class, 'destroy']);
            Route::put('/enrollments/{enrollment}', [AdminEnrollmentController::class, 'updateEnrollment']);

            // Recruitment
            Route::apiResource('candidates', CandidateController::class);
            Route::apiResource('job-openings', JobOpeningController::class)->except(['index']);
            Route::get('/job-openings/{jobOpening}/applications', [JobApplicationController::class, 'index']);
            Route::put('/job-applications/{application}', [JobApplicationController::class, 'updateStatus']);

            // CV upload for candidates
            Route::post('/candidates/{candidate}/cv', [CandidateController::class, 'uploadCv']);

            // Sick leave report
            Route::get('/leave/sick-report', [LeaveRequestController::class, 'sickLeaveReport']);

            // Attendance settings
            Route::get('/attendance-settings', [AttendanceSettingController::class, 'show']);
            Route::put('/attendance-settings', [AttendanceSettingController::class, 'update']);

            // Announcements (admin CRUD)
            Route::get('/announcements', [AnnouncementController::class, 'adminIndex']);
            Route::post('/announcements', [AnnouncementController::class, 'store']);
            Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
            Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);

            // Holidays (admin CRUD)
            Route::post('/holidays', [HolidayController::class, 'store']);
            Route::put('/holidays/{holiday}', [HolidayController::class, 'update']);
            Route::delete('/holidays/{holiday}', [HolidayController::class, 'destroy']);

            // Performance Cycles (admin CRUD)
            Route::post('/performance/cycles', [PerformanceController::class, 'createCycle']);
            Route::put('/performance/cycles/{id}', [PerformanceController::class, 'updateCycle']);

            // Department overview (admin)
            Route::get('/performance/department-overview', [PerformanceController::class, 'getDepartmentOverview']);

            // Employee Summary & Finalize Review
            Route::get('/performance/employee/{id}/summary', [PerformanceController::class, 'getEmployeeSummary']);
            Route::post('/performance/employee/{id}/finalize', [PerformanceController::class, 'finalizeReview']);

            // Regulations
            Route::apiResource('regulations', RegulationController::class);
            Route::get('/regulations/{regulation}/requirements', [RegulationController::class, 'requirements']);
            Route::post('/regulations/{regulation}/requirements', [RegulationController::class, 'storeRequirement']);
            Route::put('/regulations/{regulation}/requirements/{requirement}', [RegulationController::class, 'updateRequirement']);
            Route::delete('/regulations/{regulation}/requirements/{requirement}', [RegulationController::class, 'destroyRequirement']);
        });
    });
});
