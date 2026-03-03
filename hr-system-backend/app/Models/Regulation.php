<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Regulation extends Model
{
    protected $fillable = [
        'name',
        'jurisdiction',
        'description',
        'effective_date',
    ];

    protected $casts = [
        'effective_date' => 'date',
    ];

    public function requirements(): HasMany
    {
        return $this->hasMany(RegulationRequirement::class);
    }
}
