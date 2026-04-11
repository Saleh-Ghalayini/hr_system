<?php

namespace App\Http\Controllers\User;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    use ApiResponse;

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name'    => 'required|string|max:100',
            'last_name'     => 'required|string|max:100',
            'email'         => 'required|email|unique:users,email|max:255',
            'password'      => ['required', Password::min(8)->letters()->mixedCase()->numbers()],
            'date_of_birth' => 'required|date|before:16 years ago',
            'nationality'   => 'required|string|max:100',
            'phone_number'  => 'required|string|max:20',
            'address'       => 'required|string|max:255',
            'position'      => 'required|string|max:100',
            'gender'        => 'required|in:male,female',
            'insurance_id'  => 'required|exists:insurances,id',
            'role'          => 'sometimes|in:admin,manager,user',
            'manager_id'    => 'nullable|exists:users,id',
        ]);

        $data['password'] = bcrypt($data['password']);
        if (!isset($data['role'])) {
            $data['role'] = 'user';
        }

        $user = User::create($data);

        return $this->created([
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role,
        ], 'User created successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) return $this->notFound('User not found.');

        $data = $request->validate([
            'first_name'    => 'sometimes|string|max:100',
            'last_name'     => 'sometimes|string|max:100',
            'email'         => 'sometimes|email|unique:users,email,' . $id . '|max:255',
            'date_of_birth' => 'sometimes|date|before:16 years ago',
            'nationality'   => 'sometimes|string|max:100',
            'phone_number'  => 'sometimes|string|max:20',
            'address'       => 'sometimes|string|max:255',
            'position'      => 'sometimes|string|max:100',
            'gender'        => 'sometimes|in:male,female',
            'insurance_id'  => 'sometimes|exists:insurances,id',
            'role'          => 'sometimes|in:admin,manager,user',
            'manager_id'    => 'nullable|exists:users,id',
        ]);

        if ($request->has('password') && !empty($request->password)) {
            $request->validate(['password' => [Password::min(8)->letters()->mixedCase()->numbers()]]);
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);

        return $this->success($user, 'User updated successfully.');
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) return $this->notFound('User not found.');

        $user->delete();

        return $this->success(null, 'User deleted successfully.');
    }

    public function userCourses(Request $request, $user_id)
    {
        $user = User::find($user_id);

        if (!$user) {
            return $this->notFound('User not found.');
        }

        $enrollments = $user->enrollments()
            ->with('course:id,course_name,description,duration_hours,certificate_text')
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->get();

        return $this->success([
            'user'        => $user->only(['id', 'first_name', 'last_name']),
            'enrollments' => $enrollments,
            'total'       => $enrollments->count(),
            'completed'   => $enrollments->where('status', 'completed')->count(),
        ]);
    }
}
