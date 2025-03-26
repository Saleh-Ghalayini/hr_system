<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeePerformance extends Model
{
    protected $table = 'employees_performance';
    protected $fillable = [
        'user_id',
        'type_id',
        'rate',
        'comment',
        'manager_id',
    ];
}
