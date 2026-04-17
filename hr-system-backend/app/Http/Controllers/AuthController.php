<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use Illuminate\Http\Request;
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

    public function getDirectoryUsers(Request $request)
    {
        $query = User::with('manager:id,first_name,last_name')
            ->select(
                'id',
                'first_name',
                'last_name',
                'email',
                'position',
                'role',
                'phone_number',
                'address',
                'nationality',
                'date_of_birth',
                'manager_id'
            )
            ->orderBy('first_name')
            ->orderBy('last_name');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                    ->orWhere('last_name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%");
            });
        }

        $users = $query->paginate(50);

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

    public function getUserFullProfile($id)
    {
        // Security: Only admins can view full profiles
        $currentUser = Auth::user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            return $this->forbidden('Only administrators can view full user profiles.');
        }

        $user = User::with('manager:id,first_name,last_name')->find($id);

        if (!$user) {
            return $this->notFound('User not found.');
        }

        $userData = $user->only([
            'id',
            'first_name',
            'last_name',
            'email',
            'position',
            'gender',
            'date_of_birth',
            'nationality',
            'phone_number',
            'address',
            'manager_id',
            'role',
        ]);

        $userData['date_of_birth'] = $user->date_of_birth?->format('Y-m-d');

        $jobDetailData = $user->jobDetail ? array_merge($user->jobDetail->toArray(), [
            'hiring_date' => $user->jobDetail->hiring_date?->format('Y-m-d'),
        ]) : null;

        return $this->success([
            'user'       => $userData,
            'job_detail' => $jobDetailData,
            'manager'    => $user->manager ? [
                'id' => $user->manager->id,
                'first_name' => $user->manager->first_name,
                'last_name' => $user->manager->last_name,
            ] : null,
        ]);
    }

    public function updateUserBasicInfo(Request $request, $id)
    {
        // Security: Only admins can edit other users' basic info
        $currentUser = Auth::user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            return $this->forbidden('Only administrators can edit user profiles.');
        }

        $user = User::find($id);
        if (!$user) {
            return $this->notFound('User not found.');
        }

        $validated = $request->validate([
            'first_name'    => 'sometimes|string|max:100',
            'last_name'     => 'sometimes|string|max:100',
            'email'         => 'sometimes|email|unique:users,email,' . $id . '|max:255',
            'date_of_birth' => 'sometimes|date|before:16 years ago',
            'nationality'   => 'sometimes|string|max:100',
            'phone_number'  => 'sometimes|string|max:20',
            'address'       => 'sometimes|string|max:255',
            'gender'        => 'sometimes|in:male,female',
        ]);

        $user->update($validated);

        return $this->success($user, 'Basic info updated successfully.');
    }

    public function updateUserJobDetails(Request $request, $id)
    {
        // Security: Only admins can edit other users' job details
        $currentUser = Auth::user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            return $this->forbidden('Only administrators can edit user job details.');
        }

        $user = User::find($id);
        if (!$user) {
            return $this->notFound('User not found.');
        }

        $jobDetail = $user->jobDetail;
        if (!$jobDetail) {
            return $this->notFound('Job details not found for this user.');
        }

        $validated = $request->validate([
            'title'             => 'sometimes|string|max:100',
            'employment_type'   => 'sometimes|in:full_time,part_time,contract,internship',
            'employee_level'    => 'sometimes|in:junior,mid-senior,senior',
            'work_location'     => 'sometimes|in:on_site,remote,hybrid',
            'employment_status'=> 'sometimes|in:active,terminated',
            'hiring_date'       => 'sometimes|date',
        ]);

        $jobDetail->update($validated);

        return $this->success($jobDetail->fresh(), 'Job details updated successfully.');
    }

    public function login(LoginRequest $request)
    {
        if (!$token = Auth::attempt($request->validated())) {
            return $this->error('Invalid credentials.', 401, [
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();

        // Block terminated employees from logging in
        $jobDetail = $user->jobDetail;
        if ($jobDetail && $jobDetail->employment_status === 'terminated') {
            Auth::logout();
            return $this->error('Your account has been terminated. Please contact HR.', 403);
        }

        return $this->success([
            'id'          => $user->id,
            'first_name'  => $user->first_name,
            'last_name'   => $user->last_name,
            'email'       => $user->email,
            'role'        => $user->role,
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
