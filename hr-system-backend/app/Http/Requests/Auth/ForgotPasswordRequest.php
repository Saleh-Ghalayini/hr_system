<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseFormRequest;

class ForgotPasswordRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'email' => 'required|email|exists:users,email',
        ];
    }

    public function messages(): array
    {
        return [
            'email.exists' => 'No account found with that email address.',
        ];
    }
}
