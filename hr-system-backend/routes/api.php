<?php

use App\Http\Controllers\Admin\AdminEnrollmentController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\User\UserController;

use App\Http\Controllers\UserController;

use Illuminate\Support\Facades\Route;

Route::group(["prefix" => "v1"], function () {
    // Unauthenticated routes
    Route::group(["prefix" => "guest"], function () {
        Route::post("/login", [AuthController::class, "login"]);
    });

    // Authenticated routes
    Route::group(["middleware" => "auth:api"], function () {
        Route::get('/validate-token', [AuthController::class, "validateToken"]);

        // login users only
        //Admin Routes
        // get job details for a users
        Route::get("/getuserjobdetails", [UserController::class, "getUserJobDetails"]);
        //upload user phoot
        Route::post("/uploadphoto", [UserController::class, "uploadProfilePhoto"]);
        // update user info
        Route::post("/updatebasicinfo", [UserController::class, "updateUserBasicInfo"]);
        //update user job details
        Route::post("/updatejobdetails", [UserController::class, "updateJobDetails"]);


        // Admin routes
        Route::prefix('admin')->middleware(['AdminMiddleware'])->group(function () {
            //courses routes
            Route::get("/getallusers", [AuthController::class, "getAllUsers"]);
            Route::get('/courses', [CourseController::class, "index"]);
            Route::post('/courses', [CourseController::class, "store"]);
            Route::put('/courses/{course}', [CourseController::class, "update"]);
            Route::delete('/courses/{course}', [CourseController::class, "destroy"]);

            //enrollments routes
            Route::get('/enrollments', [AdminEnrollmentController::class, "index"]);
            Route::post('/enrollments', [AdminEnrollmentController::class, "store"]);
            Route::put('/enrollments/{enrollment}', [AdminEnrollmentController::class, "updateEnrollment"]);
            Route::delete('/enrollments/{enrollment}', [AdminEnrollmentController::class, "destroy"]);
        });
        Route::prefix('user')->middleware(['AdminMiddleware'])->group(function () {
            Route::get('/enrollments', [UserController::class, 'enrollments']);
        });
      
    });
});

