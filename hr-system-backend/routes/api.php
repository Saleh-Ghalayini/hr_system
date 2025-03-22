<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::group(["prefix" => "v1"], function () {
    //unauthenticated routes
    Route::group(["prefix" => "guest"], function () {
        Route::post("/login", [AuthController::class, "login"]);
        // Route::post('/add-user', [AuthController::class, "addUser"]);
        Route::group(["prefix" => "admin", "middleware" => "AdminMiddleware"], function () {
            Route::post('/add-user', [AuthController::class, "addUser"]);
        });
    });
    //authenticated routes via JWTtoken
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

    });
});
//php artisan make:middleware AdminMiddleware
