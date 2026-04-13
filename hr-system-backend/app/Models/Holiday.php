<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = [
        'name',
        'date:Y-m-d',
        'type',
        'is_recurring',
        'description',
    ];

    protected $casts = [
        'date:Y-m-d'         => 'date:Y-m-d',
        'is_recurring' => 'boolean',
    ];
}
