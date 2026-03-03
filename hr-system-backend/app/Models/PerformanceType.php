<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceType extends Model
{
    protected $fillable = [
        'name',
    ];

    public function teamPerformances(): HasMany
    {
        return $this->hasMany(TeamPerformance::class, 'type_id');
    }

    public function employeePerformances(): HasMany
    {
        return $this->hasMany(EmployeePerformance::class, 'type_id');
    }
}
