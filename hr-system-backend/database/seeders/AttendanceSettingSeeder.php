<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttendanceSettingSeeder extends Seeder
{
    public function run(): void
    {
        // Upsert so re-running the seeder is safe
        if (DB::table('attendance_settings')->count() === 0) {
            DB::table('attendance_settings')->insert([
                'work_start'                => '08:00:00',
                'work_end'                  => '17:00:00',
                'late_threshold_minutes'    => 15,
                'overtime_threshold_minutes' => 30,
                'max_radius_meters'          => 100,
                'company_lat'               => (float) env('COMPANY_LAT', 0),
                'company_lon'               => (float) env('COMPANY_LON', 0),
                'require_location'          => true,
                'allow_remote_checkin'      => false,
                'working_days_per_week'     => 5,
                'working_days'              => json_encode(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
                'created_at'                => now(),
                'updated_at'                => now(),
            ]);
        }
    }
}
