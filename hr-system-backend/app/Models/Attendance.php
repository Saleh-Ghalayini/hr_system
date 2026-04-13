<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'full_name',
        'date',
        'check_in',
        'check_in_lat',
        'check_in_lon',
        'check_out',
        'check_out_lat',
        'check_out_lon',
        'status',
        'working_hours',
        'time_in_status',
        'time_out_status',
        'loc_in_status',
        'loc_out_status',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
