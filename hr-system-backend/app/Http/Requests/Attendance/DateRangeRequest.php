<?php

namespace App\Http\Requests\Attendance;

use App\Http\Requests\BaseFormRequest;

class DateRangeRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date'   => 'sometimes|date_format:Y-m-d|after_or_equal:start_date',
            'date'       => 'sometimes|date_format:Y-m-d',
            'full_name'  => 'sometimes|string|max:100',
            'status'     => 'sometimes|string|in:On-time,Late,Absent',
        ];
    }
}
