<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    use ApiResponse;

    public function getAllUsers()
    {
        $users = User::with('jobDetail:id,user_id,title,employment_type,employment_status,employee_level,work_location,hiring_date')
            ->select('id', 'first_name', 'last_name', 'email', 'position', 'gender', 'role', 'created_at')
            ->get();

        return $this->success($users);
    }

    public function getUserById($id)
    {
        $user = User::with(['jobDetail', 'payroll', 'leaveBalance'])->find($id);

        if (!$user) {
            return $this->notFound('User not found.');
        }

        return $this->success($user);
    }

    public function login(LoginRequest $request)
    {
        if (!$token = Auth::attempt($request->validated())) {
            return $this->error('Invalid credentials.', 401, [
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();

        return $this->success([
            'id'          => $user->id,
            'first_name'  => $user->first_name,
            'last_name'   => $user->last_name,
            'email'       => $user->email,
            'role'        => $user->role,
            'profile_url' => $user->profile_url,
            'token'       => $token,
        ], 'Login successful.');
    }

    public function addUser(RegisterRequest $request)
    {
        $data             = $request->validated();
        $data['password'] = bcrypt($data['password']);

        $user  = User::create($data);
        $token = Auth::login($user);

        return $this->created([
            'id'         => $user->id,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'email'      => $user->email,
            'role'       => $user->role,
            'token'      => $token,
        ], 'Registration successful.');
    }

    public function validateToken()
    {
        $user = Auth::user();

        return $this->success([
            'id'          => $user->id,
            'first_name'  => $user->first_name,
            'last_name'   => $user->last_name,
            'email'       => $user->email,
            'role'        => $user->role,
            'profile_url' => $user->profile_url,
        ], 'Token is valid.');
    }

    public function logout()
    {
        Auth::logout();

        return $this->success(null, 'Logout successful.');
    }
}
