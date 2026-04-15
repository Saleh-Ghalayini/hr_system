<?php

namespace App\Http\Requests\Attendance;

use App\Http\Requests\BaseFormRequest;
use App\Models\AttendanceSetting;

class CheckInRequest extends BaseFormRequest
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
            'check_in_lon' => $baseRule . '|numeric|between:-180,180|required_with:check_in_lat',
            'check_in_lat' => $baseRule . '|numeric|between:-90,90|required_with:check_in_lon',
        ];
    }
}
