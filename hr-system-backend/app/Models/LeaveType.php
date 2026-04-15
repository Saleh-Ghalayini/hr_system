<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    protected $fillable = [
        'name',
        'max_days',
        'is_balance_exempt',
    ];

    protected $casts = [
        'max_days' => 'integer',
        'is_balance_exempt' => 'boolean',
    ];
}
