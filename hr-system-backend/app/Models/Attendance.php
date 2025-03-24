<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'check_in',
        'check_in_lon',
        'check_in_lat',
        'check_out',
        'check_out_lon',
        'check_out_lat',
        'location_status',
        'status',
        'working_hours'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
