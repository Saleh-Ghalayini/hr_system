<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
  
    public function handle(Request $request, Closure $next): Response
    {
        // if (!auth()->check() || auth()->user()->role !== 'admin') {
        //     return response()->json([
        //         'status' => 'error',
        //         'message' => 'Unauthorized'
        //     ], 403);
        // }

        return $next($request);
    }
}
