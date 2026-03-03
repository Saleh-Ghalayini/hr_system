<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Insurance extends Model
{
    protected $fillable = [
        'type',
        'cost',
        'old_cost',
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
