<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
  
    public function handle(Request $request, Closure $next): Response
    {
       $user = Auth::user();
       if($user->role !== 'admin'){
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 401);
       }
       return $next($request);
    }
}
