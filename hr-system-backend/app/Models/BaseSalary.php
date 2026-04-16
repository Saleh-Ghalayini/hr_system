<?php

namespace App\Models;

use App\Observers\BaseSalaryObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[ObservedBy([BaseSalaryObserver::class])]
class BaseSalary extends Model
{
    protected $fillable = [
        'position',
        'salary',
    ];

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }
}
