<?php

use App\Http\Middleware\AdminMiddleware;
use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            "AdminMiddleware" => AdminMiddleware::class
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Request $request) {
            if ($request->is("api/*")) {
                return response()->json([
                    "success" => false,
                    "error" => "Unauthorized",
                    "message" => "token 5alsa medeta "
                ], 401);
            }
        });
    })->create();
