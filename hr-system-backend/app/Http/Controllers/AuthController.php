<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    use ApiResponse;

    public function getAllUsers()
    {
        $users = User::with('jobDetail:id,user_id,title,employment_type,employment_status,employee_level,work_location,hiring_date')
            ->select('id', 'first_name', 'last_name', 'email', 'position', 'gender', 'role', 'created_at')
            ->paginate(200);

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

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        $newPassword = $this->generatePassword();
        $user->update(['password' => bcrypt($newPassword)]);

        Mail::raw(
            "Hello {$user->first_name},\n\n"
            . "Your HR System password has been reset.\n\n"
            . "Your new temporary password is:\n\n"
            . "    {$newPassword}\n\n"
            . "Please log in and change your password as soon as possible.\n\n"
            . "Best regards,\n"
            . "HR System",
            function ($message) use ($user) {
                $message->to($user->email, "{$user->first_name} {$user->last_name}")
                        ->subject('Your New HR System Password');
            }
        );

        return $this->success(null, 'A new password has been sent to your email address.');
    }

    private function generatePassword(int $length = 12): string
    {
        $upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        $lower   = 'abcdefghjkmnpqrstuvwxyz';
        $digits  = '23456789';
        $special = '!@#$%&*';

        // Guarantee at least one character from each group
        $chars = [
            $upper[$this->rand($upper)],
            $upper[$this->rand($upper)],
            $lower[$this->rand($lower)],
            $lower[$this->rand($lower)],
            $digits[$this->rand($digits)],
            $digits[$this->rand($digits)],
            $special[$this->rand($special)],
        ];

        $all = $upper . $lower . $digits . $special;
        for ($i = count($chars); $i < $length; $i++) {
            $chars[] = $all[random_int(0, strlen($all) - 1)];
        }

        shuffle($chars);
        return implode('', $chars);
    }

    private function rand(string $pool): int
    {
        return random_int(0, strlen($pool) - 1);
    }
}
