<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    function user() : BelongsTo{
     return   $this->belongsTo(User::class,'user_id');
    }
}
