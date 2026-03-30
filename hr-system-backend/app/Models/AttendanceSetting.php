<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceSetting extends Model
{
    protected $fillable = [
        'work_start',
        'work_end',
        'late_threshold_minutes',
        'overtime_threshold_minutes',
        'max_radius_meters',
        'company_lat',
        'company_lon',
        'require_location',
        'allow_remote_checkin',
        'working_days_per_week',
        'working_days',
    ];

    protected $casts = [
        'require_location'   => 'boolean',
        'allow_remote_checkin' => 'boolean',
        'working_days'       => 'array',
        'company_lat'        => 'float',
        'company_lon'        => 'float',
    ];

    /**
     * Get the single settings record (create with defaults if missing).
     */
    public static function current(): self
    {
        return static::firstOrCreate([], [
            'work_start'                 => '09:00:00',
            'work_end'                   => '17:00:00',
            'late_threshold_minutes'     => 15,
            'overtime_threshold_minutes' => 30,
            'max_radius_meters'          => 100,
            'company_lat'                => 0,
            'company_lon'                => 0,
            'require_location'           => true,
            'allow_remote_checkin'       => false,
            'working_days_per_week'      => 5,
            'working_days'               => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        ]);
    }
}
