<?php

namespace App\Http\Requests\Leave;

use App\Http\Requests\BaseFormRequest;

class CreateLeaveRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'leave_type'      => 'required|in:annual,sick,casual,other,pto,unpaid,maternity,paternity,bereavement',
            'start_date'      => 'required|date|after_or_equal:today',
            'end_date'        => 'required|date|after_or_equal:start_date',
            'reason'          => 'required|string|max:1000',
            'document'        => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'is_half_day'     => 'nullable|boolean',
            'half_day_period' => 'nullable|in:morning,afternoon|required_if:is_half_day,true',
        ];
    }
}
