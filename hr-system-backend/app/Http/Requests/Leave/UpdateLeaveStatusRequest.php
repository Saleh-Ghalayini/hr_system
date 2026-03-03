<?php

namespace App\Http\Requests\Leave;

use App\Http\Requests\BaseFormRequest;

class UpdateLeaveStatusRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'status' => 'required|in:approved,rejected',
        ];
    }
}
