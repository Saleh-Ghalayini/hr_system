<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseFormRequest;

class UpdateBasicInfoRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'first_name'    => 'sometimes|string|max:100',
            'last_name'     => 'sometimes|string|max:100',
            'date_of_birth' => 'sometimes|date|before:today',
            'nationality'   => 'sometimes|string|max:100',
            'phone_number'  => 'sometimes|string|max:20',
            'address'       => 'sometimes|string|max:255',
            'position'      => 'sometimes|string|max:100',
        ];
    }
}
