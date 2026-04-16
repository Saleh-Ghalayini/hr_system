<?php

namespace App\Models;

use App\Observers\InsuranceObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[ObservedBy([InsuranceObserver::class])]
class Insurance extends Model
{
    protected $fillable = [
        'type',
        'cost',
        'old_cost',
    ];

    protected $casts = [
        'cost'    => 'float',
        'old_cost' => 'float',
    ];

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
