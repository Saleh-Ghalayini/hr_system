<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseFormRequest;

class UpdateBasicInfoRequest extends BaseFormRequest
{
    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'first_name'    => 'sometimes|string|max:100',
            'last_name'     => 'sometimes|string|max:100',
            'email'         => 'sometimes|email|max:255|unique:users,email,' . $userId,
            'date_of_birth' => 'sometimes|date|before:today',
            'nationality'   => 'sometimes|string|max:100',
            'phone_number'  => 'sometimes|string|max:20',
            'gender'        => 'sometimes|in:male,female',
            'address'       => 'sometimes|string|max:255',
            'position'      => 'sometimes|string|max:100',
        ];
    }
}
