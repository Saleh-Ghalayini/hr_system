<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = [
        'name',
        'date',
        'type',
        'is_recurring',
        'description',
    ];

    protected $casts = [
        'date'         => 'date',
        'is_recurring' => 'boolean',
    ];
}
