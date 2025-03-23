<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    private function validateAuthRequest(Request $request, bool $isLogin = false)
    {
        $rules = [
            'email' => ['required', 'email'],
            'password' => [
                'required',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
        ];

        if (!$isLogin) {
            // Add validation for new required fields
            $rules['first_name'] = ['required', 'string', 'max:255'];
            $rules['last_name'] = ['required', 'string', 'max:255'];
            $rules['date-of-birth'] = ['required', 'date'];
            $rules['nationality'] = ['required', 'string', 'max:255'];
            $rules['phone_number'] = ['required', 'numeric'];
            $rules['address'] = ['required', 'string', 'max:255'];
            $rules['position'] = ['required', 'string', 'max:255'];
            $rules['gender'] = ['required', 'in:male,female,other'];
            $rules['insurance_id'] = ['required', 'numeric'];
            $rules['role'] = ['required', 'in:admin,user,manager'];
        }

        return Validator::make($request->all(), $rules);
    }

    public function login(Request $request)
    {
        $validator = $this->validateAuthRequest($request, true);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
                'errors' => ['email' => ['The provided credentials are incorrect.']]
            ], 401);
        }

        $user = Auth::user();
        $userDetails = [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'token' => $token
        ];

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => $userDetails
        ], 200);
    }

    public function addUser(Request $request)
    {
        $validator = $this->validateAuthRequest($request, false);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'date-of-birth' => $request->{'date-of-birth'},
                'nationality' => $request->nationality,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
                'position' => $request->position,
                'gender' => $request->gender,
                'insurance_id' => $request->insurance_id,
                'role' => $request->role,
                // Optional fields
                'profile_url' => $request->profile_url ?? null,
                'manager_id' => $request->manager_id ?? null,
            ]);

            $token = Auth::login($user);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'data' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'token' => $token
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'errors' => ['server' => ['An error occurred during registration.']]
            ], 500);
        }
    }
    public function validateToken(Request $request)
    {
        // dd("validate token");
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $user = Auth::user();
        return response()->json([
            'success' => true,
            'message' => 'Token is valid',
            'data' => $user
        ], 200);
    }

    public function logout()
    {
        Auth::logout();
        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ], 200);
    }
}
