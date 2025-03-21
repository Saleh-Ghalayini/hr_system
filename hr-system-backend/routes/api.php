<?php

use App\Http\Controllers\AuthController;
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

    });
});
//php artisan make:middleware AdminMiddleware