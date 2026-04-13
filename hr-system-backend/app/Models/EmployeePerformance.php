<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeePerformance extends Model
{
    use SoftDeletes;

    protected $table = 'employees_performance';

    protected $fillable = [
        'user_id',
        'manager_id',
        'type_id',
        'rate',
        'comment',
        'created_date',
    ];

    protected $casts = [
        'created_date' => 'date:Y-m-d',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(PerformanceType::class, 'type_id');
    }
}
