<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'first_name'    => 'required|string|max:100',
            'last_name'     => 'required|string|max:100',
            'email'         => 'required|email|unique:users,email|max:255',
            'password'      => ['required', Password::min(8)->letters()->mixedCase()->numbers()],
            'date_of_birth' => 'required|date|before:16 years ago',
            'nationality'   => 'required|string|max:100',
            'phone_number'  => 'required|string|max:20',
            'address'       => 'required|string|max:255',
            'position'      => 'required|string|max:100',
            'gender'        => 'required|in:male,female,other',
            'insurance_id'  => 'required|exists:insurances,id',
        ];
    }
}
