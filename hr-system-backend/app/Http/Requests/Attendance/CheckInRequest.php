<?php

namespace App\Http\Requests\Attendance;

use App\Http\Requests\BaseFormRequest;

class CheckInRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'check_in_lon' => 'required|numeric|between:-180,180',
            'check_in_lat' => 'required|numeric|between:-90,90',
        ];
    }
}
