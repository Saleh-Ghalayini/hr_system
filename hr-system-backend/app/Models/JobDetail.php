<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobDetail extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'employment_type',
        'employment_status',
        'employee_level',
        'work_location',
        'hiring_date',
    ];

    protected $casts = [
        'hiring_date' => 'date:Y-m-d',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
