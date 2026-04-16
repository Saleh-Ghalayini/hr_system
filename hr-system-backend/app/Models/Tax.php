<?php

namespace App\Models;

use App\Observers\TaxObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[ObservedBy([TaxObserver::class])]
class Tax extends Model
{
    protected $fillable = [
        'rate',
        'label',
    ];

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }
}
