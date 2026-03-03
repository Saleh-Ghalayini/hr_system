<?php

use App\Http\Controllers\Admin\AdminEnrollmentController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\InsuranceController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\JobOpeningController;
use App\Http\Controllers\LeaveBalanceController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RegulationController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ─────────────────────────────────────────────────────────────────
    // GUEST (unauthenticated)
    // ─────────────────────────────────────────────────────────────────
    Route::prefix('guest')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'addUser']);

        // Candidates can view open positions and apply without an account
        Route::get('/job-openings', [JobOpeningController::class, 'publicIndex']);
        Route::post('/job-openings/{jobOpening}/apply', [JobApplicationController::class, 'apply']);
    });

    // ─────────────────────────────────────────────────────────────────
    // AUTHENTICATED (any role)
    // ─────────────────────────────────────────────────────────────────
    Route::middleware('auth:api')->group(function () {

        // Auth
        Route::get('/validate-token', [AuthController::class, 'validateToken']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Profile
        Route::get('/profile/job-details', [UserController::class, 'getUserJobDetails']);
        Route::get('/profile/photo', [UserController::class, 'getImageUrl']);
        Route::post('/profile/photo', [UserController::class, 'uploadProfilePhoto']);
        Route::put('/profile/basic-info', [UserController::class, 'updateUserBasicInfo']);
        Route::put('/profile/job-details', [UserController::class, 'updateJobDetails']);

        // Attendance (own)
        Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
        Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
        Route::get('/attendance/my', [AttendanceController::class, 'getMyAttendance']);

        // Leave (own)
        Route::get('/leave/requests', [LeaveRequestController::class, 'getLeaveRequestsByUser']);
        Route::post('/leave/requests', [LeaveRequestController::class, 'leaveRequest']);
        Route::get('/leave/balance', [LeaveBalanceController::class, 'getLeaveBalanceForUser']);

        // Enrollments (own)
        Route::get('/enrollments/my', [UserController::class, 'enrollments']);

        // Performance (self-rate team, view own ratings)
        Route::post('/performance/rate-team', [PerformanceController::class, 'rateTeam']);
        Route::get('/performance/types', [PerformanceController::class, 'getTypes']);
        Route::get('/performance/my-team-rate', [PerformanceController::class, 'getLastTeamRate']);
        Route::get('/performance/my-rate', [PerformanceController::class, 'getEmployeRate']);

        // ─────────────────────────────────────────────────────────────
        // MANAGER + ADMIN
        // ─────────────────────────────────────────────────────────────
        Route::middleware('ManagerMiddleware')->group(function () {

            // Team attendance
            Route::get('/attendance/team', [AttendanceController::class, 'getUserAttendance']);

            // Rate employees (managers rate their reports)
            Route::post('/performance/rate-employee', [PerformanceController::class, 'rateEmployee']);
            Route::get('/performance/average', [PerformanceController::class, 'getAverageRate']);

            // Leave approval
            Route::put('/leave/requests/{leaveRequest}', [LeaveRequestController::class, 'updateLeaveRequest']);

            // Tasks & Projects (managers can manage)
            Route::apiResource('tasks', TaskController::class);
            Route::apiResource('projects', ProjectController::class);
            Route::get('/tasks/{task}/activity', [TaskController::class, 'activityLog']);
        });

        // ─────────────────────────────────────────────────────────────
        // ADMIN ONLY
        // ─────────────────────────────────────────────────────────────
        Route::middleware('AdminMiddleware')->prefix('admin')->group(function () {

            // Users
            Route::get('/users', [AuthController::class, 'getAllUsers']);
            Route::get('/users/{id}', [AuthController::class, 'getUserById']);

            // Attendance (full access)
            Route::get('/attendance/all', [AttendanceController::class, 'getAllUsersAttendance']);
            Route::get('/attendance/user/{user_id}', [AttendanceController::class, 'getUserAttendance']);
            Route::get('/attendance/search', [AttendanceController::class, 'getUserByName']);

            // Leave (full access)
            Route::get('/leave/requests', [LeaveRequestController::class, 'getLeaveRequests']);
            Route::get('/leave/balances', [LeaveBalanceController::class, 'getLeaveBalances']);
            Route::get('/leave/balance/{user}', [LeaveBalanceController::class, 'getLeaveBalanceForUser']);
            Route::get('/leave/balance-by-id/{id}', [LeaveBalanceController::class, 'getLeaveBalanceForUserById']);

            // Payroll
            Route::get('/payroll', [PayrollController::class, 'getPayrolls']);

            // Insurance
            Route::get('/insurances', [InsuranceController::class, 'getInsurances']);
            Route::put('/insurances/{insurance}', [InsuranceController::class, 'updatePlan']);

            // Courses
            Route::apiResource('courses', CourseController::class);

            // Enrollments
            Route::get('/enrollments', [AdminEnrollmentController::class, 'index']);
            Route::post('/enrollments', [AdminEnrollmentController::class, 'store']);
            Route::put('/enrollments/{enrollment}', [AdminEnrollmentController::class, 'updateEnrollment']);
            Route::delete('/enrollments/{enrollment}', [AdminEnrollmentController::class, 'destroy']);

            // Recruitment
            Route::apiResource('job-openings', JobOpeningController::class)->except(['index']);
            Route::get('/job-openings/{jobOpening}/applications', [JobApplicationController::class, 'index']);
            Route::put('/job-applications/{application}', [JobApplicationController::class, 'updateStatus']);
            Route::apiResource('candidates', CandidateController::class);

            // Regulations
            Route::apiResource('regulations', RegulationController::class);
            Route::get('/regulations/{regulation}/requirements', [RegulationController::class, 'requirements']);
            Route::post('/regulations/{regulation}/requirements', [RegulationController::class, 'storeRequirement']);
            Route::put('/regulations/{regulation}/requirements/{requirement}', [RegulationController::class, 'updateRequirement']);
            Route::delete('/regulations/{regulation}/requirements/{requirement}', [RegulationController::class, 'destroyRequirement']);
        });
    });
});
