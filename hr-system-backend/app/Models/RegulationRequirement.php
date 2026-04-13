<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegulationRequirement extends Model
{
    protected $fillable = [
        'regulation_id',
        'requirement',
        'deadline',
        'status',
        'responsible_party',
    ];

    protected $casts = [
        'deadline' => 'date:Y-m-d',
    ];

    public function regulation(): BelongsTo
    {
        return $this->belongsTo(Regulation::class);
    }

    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_party');
    }
}
