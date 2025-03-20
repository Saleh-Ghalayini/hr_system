<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group(["prefix" => "v0.1"], function () {
    //unauthenticated routes
    Route::group(["prefix" => "guest"], function () {
        Route::post("/login", [AuthController::class, "login"]);
        Route::post("/signup", [AuthController::class, "signup"]);
    });
    //authenticated routes via JWTtoken
    Route::group(["middleware" => "auth:api"], function () {
        // login users only
        Route::group(["prefix" => "user"], function () {
            
        });
    });
});