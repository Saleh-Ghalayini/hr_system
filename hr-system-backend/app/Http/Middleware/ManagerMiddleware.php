<?php

namespace App\Http\Middleware;

use App\Traits\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ManagerMiddleware
{
    use ApiResponse;

    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $this->unauthorized();
        }

        if (!in_array($user->role, ['admin', 'manager'])) {
            return $this->forbidden('Manager or admin access required');
        }

        return $next($request);
    }
}
