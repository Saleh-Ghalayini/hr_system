<?php

namespace App\Http\Requests\Attendance;

use App\Http\Requests\BaseFormRequest;

class CheckOutRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'check_out_lon' => 'required|numeric|between:-180,180',
            'check_out_lat' => 'required|numeric|between:-90,90',
        ];
    }
}
