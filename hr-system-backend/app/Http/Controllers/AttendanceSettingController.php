<?php

namespace App\Http\Controllers;

use App\Models\AttendanceSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
        $settings = AttendanceSetting::current();

        $validator = Validator::make($request->all(), [
            'work_start'                 => 'sometimes|date_format:H:i',
            'work_end'                   => 'sometimes|date_format:H:i',
            'late_threshold_minutes'     => 'sometimes|integer|min:0|max:120',
            'overtime_threshold_minutes' => 'sometimes|integer|min:0|max:120',
            'max_radius_meters'          => 'sometimes|integer|min:10|max:10000',
            'company_lat'                => 'sometimes|numeric|between:-90,90',
            'company_lon'                => 'sometimes|numeric|between:-180,180',
            'require_location'           => 'sometimes|boolean',
            'allow_remote_checkin'       => 'sometimes|boolean',
            'working_days_per_week'      => 'sometimes|integer|min:1|max:7',
            'working_days'               => 'sometimes|array|min:1|max:7',
            'working_days.*'             => 'distinct|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
        ]);

        $validator->after(function ($validator) use ($request, $settings) {
            $effectiveStart = $request->input('work_start', substr((string) $settings->work_start, 0, 5));
            $effectiveEnd = $request->input('work_end', substr((string) $settings->work_end, 0, 5));

            if ($effectiveStart !== null && $effectiveEnd !== null && $effectiveEnd <= $effectiveStart) {
                $validator->errors()->add('work_end', 'The work end time must be after the effective work start time.');
            }
        });

        $data = $validator->validate();

        if (array_key_exists('working_days', $data)) {
            $data['working_days_per_week'] = count($data['working_days']);
        }

        $settings->update($data);

        return $this->success($settings->fresh(), 'Attendance settings updated successfully.');
    }
}
