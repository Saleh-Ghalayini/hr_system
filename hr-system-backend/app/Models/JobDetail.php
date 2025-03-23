<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobDetail extends Model
{
    
    protected $fillable = [
        'title',
        'employment_type',
        'employment_status',
        'employee_level',
        'work_location',
        'hiring_date',
        'user_id',
    ];
}
