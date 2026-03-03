<?php

namespace App\Http\Middleware;

use Closure;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    use ApiResponse;

    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $this->unauthorized();
        }

        if ($user->role !== 'admin') {
            return $this->forbidden('Admin access required');
        }

        return $next($request);
    }
}
