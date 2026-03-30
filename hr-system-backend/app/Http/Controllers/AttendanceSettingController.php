<?php

namespace App\Http\Controllers;

use App\Models\AttendanceSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AttendanceSettingController extends Controller
{
    use ApiResponse;

    /** GET /admin/attendance-settings */
    public function show()
    {
        return $this->success(AttendanceSetting::current());
    }

    /** PUT /admin/attendance-settings */
    public function update(Request $request)
    {
        $data = $request->validate([
            'work_start'                 => 'sometimes|date_format:H:i',
            'work_end'                   => 'sometimes|date_format:H:i|after:work_start',
            'late_threshold_minutes'     => 'sometimes|integer|min:0|max:120',
            'overtime_threshold_minutes' => 'sometimes|integer|min:0|max:120',
            'max_radius_meters'          => 'sometimes|integer|min:10|max:10000',
            'company_lat'                => 'sometimes|numeric|between:-90,90',
            'company_lon'                => 'sometimes|numeric|between:-180,180',
            'require_location'           => 'sometimes|boolean',
            'allow_remote_checkin'       => 'sometimes|boolean',
            'working_days_per_week'      => 'sometimes|integer|min:1|max:7',
            'working_days'               => 'sometimes|array',
            'working_days.*'             => 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
        ]);

        $settings = AttendanceSetting::current();
        $settings->update($data);

        return $this->success($settings->fresh(), 'Attendance settings updated successfully.');
    }
}
