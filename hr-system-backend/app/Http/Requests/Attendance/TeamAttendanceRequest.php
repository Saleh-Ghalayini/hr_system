<?php

namespace App\Http\Requests\Attendance;

class TeamAttendanceRequest extends DateRangeRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
        ]);
    }
}
