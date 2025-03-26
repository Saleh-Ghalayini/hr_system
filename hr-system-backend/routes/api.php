<?php

use App\Http\Controllers\Admin\AdminEnrollmentController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\InsuranceController;
use App\Http\Controllers\LeaveBalanceController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PayrollController;

Route::group(["prefix" => "v1"], function () {
    // Unauthenticated routes
    Route::group(["prefix" => "guest"], function () {
        Route::post("/login", [AuthController::class, "login"]);
        Route::post("/add-user", [AuthController::class, "addUser"]);
    });

    // Authenticated routes
    Route::group(["middleware" => "auth:api"], function () {
        // check-in/out for admin and user
        Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
        Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);

        Route::get('/validate-token', [AuthController::class, "validateToken"]);
        // get job details for a users
        Route::get("/getuserjobdetails", [UserController::class, "getUserJobDetails"]);
        //upload user phoot
        Route::post("/uploadphoto", [UserController::class, "uploadProfilePhoto"]);
        // update user info
        Route::post("/updatebasicinfo", [UserController::class, "updateUserBasicInfo"]);
        //update user job details
        Route::post("/updatejobdetails", [UserController::class, "updateJobDetails"]);


        Route::post("/rateteam",[PerformanceController::class,"rateTeam"]);

        Route::get("/getratetypes",[PerformanceController::class,"getTypes"]);
        // rate done by employe for his team
        Route::get("/latestteamrate",[PerformanceController::class,"getLastTeamRate"]);
        // rate for employe from his manager
        Route::get("/getemplyeerate",[PerformanceController::class,"getEmployeRate"]);

        // Admin routes
        Route::prefix('admin')->middleware(['AdminMiddleware'])->group(function () {

            //courses routes
            Route::get("/getallusers", [AuthController::class, "getAllUsers"]);
            Route::get("/getuserbyid/{id}", [AuthController::class, "getUserById"]);
            Route::get('/courses', [CourseController::class, "index"]);
            Route::post('/courses', [CourseController::class, "store"]);
            Route::put('/courses/{course}', [CourseController::class, "update"]);
            Route::delete('/courses/{course}', [CourseController::class, "destroy"]);

            //enrollments routes
            Route::get('/enrollments', [AdminEnrollmentController::class, "index"]);
            Route::post('/enrollments', [AdminEnrollmentController::class, "store"]);
            Route::put('/enrollments/{enrollment}', [AdminEnrollmentController::class, "updateEnrollment"]);
            Route::delete('/enrollments/{enrollment}', [AdminEnrollmentController::class, "destroy"]);


            //attendance routes
            Route::get('/attendance/user', [AttendanceController::class, "getUserByName"]);
            Route::get('/attendance/all', [AttendanceController::class, "getAllUsersAttendance"]);
            Route::get('/attendance/user/{user_id}', [AttendanceController::class, "getUserAttendance"]);



            //leave requests routes
            Route::get('/leave-requests', [LeaveRequestController::class, "getLeaveRequests"]);
            Route::put('/leave-requests/{leaveRequest}', [LeaveRequestController::class, "updateLeaveRequest"]);

            //leave balance routes
            //get leave balance for all users
            Route::get('/leave-balances', [LeaveBalanceController::class, "getLeaveBalances"]);
            //get leave balance for a user
            Route::get('/leave-balance/{user}', [LeaveBalanceController::class, "getLeaveBalanceForUser"]);
            //get leave balance for a user by id
            Route::get('/leave-balance-user/{id}', [LeaveBalanceController::class, "getLeaveBalanceForUserById"]);

            // performance Routes for rates an employee
            Route::post("/rateemployee",[PerformanceController::class,"rateEmployee"]);



            //get all salaries
            Route::get('/getsalaries', [PayrollController::class, "getPayrolls"]);

            Route::get('/getinsurances', [InsuranceController::class, 'getInsurances']);
            Route::post('/updateinsurance', [InsuranceController::class, 'updatePlan']);




            // get the average rate for each type
            Route::get("/averagerate", [PerformanceController::class,"getAverageRate"]);
        });

        Route::prefix('user')->middleware(['AdminMiddleware'])->group(function () {
            Route::get('/enrollments', [UserController::class, 'enrollments']);

            //attendance routes
            Route::get('/attendance/my', [AttendanceController::class, 'getMyAttendance']);


            //leave requests routes
            //get leave requests by user
            Route::get('/leave-requests', [LeaveRequestController::class, "getLeaveRequestsByUser"]);
            //create leave request
            Route::post('/leave-request', [LeaveRequestController::class, "leaveRequest"]);
            //get leave balance
            Route::get('/leave-balance-user', [LeaveBalanceController::class, "getLeaveBalanceForUser"]);


            //leave requests routes
            //get leave requests by user
            Route::get('/leave-requests', [LeaveRequestController::class, "getLeaveRequestsByUser"]);
            //create leave request
            Route::post('/leave-request', [LeaveRequestController::class, "leaveRequest"]);
            //get leave balance
            Route::get('/leave-balance-user', [LeaveBalanceController::class, "getLeaveBalanceForUser"]);
        });

    });
});
