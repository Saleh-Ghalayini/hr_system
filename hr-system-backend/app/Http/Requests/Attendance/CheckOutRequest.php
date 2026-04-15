<?php

namespace App\Http\Requests\Attendance;

use App\Http\Requests\BaseFormRequest;
use App\Models\AttendanceSetting;

class CheckOutRequest extends BaseFormRequest
{
    public function rules(): array
    {
        $requireLocation = true;

        try {
            $requireLocation = (bool) AttendanceSetting::current()->require_location;
        } catch (\Throwable $e) {
            // Keep strict validation when settings are unavailable.
            $requireLocation = true;
        }

        $baseRule = $requireLocation ? 'required' : 'nullable';

        return [
            'check_out_lon' => $baseRule . '|numeric|between:-180,180|required_with:check_out_lat',
            'check_out_lat' => $baseRule . '|numeric|between:-90,90|required_with:check_out_lon',
        ];
    }
}
