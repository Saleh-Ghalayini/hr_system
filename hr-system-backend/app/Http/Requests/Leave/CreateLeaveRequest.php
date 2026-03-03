<?php

namespace App\Http\Requests\Leave;

use App\Http\Requests\BaseFormRequest;

class CreateLeaveRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'leave_type' => 'required|in:annual,sick,casual,other',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'reason'     => 'required|string|max:1000',
        ];
    }
}
