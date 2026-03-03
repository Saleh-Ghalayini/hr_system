<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseFormRequest;

class UploadProfilePhotoRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'image' => 'required|string',
        ];
    }
}
