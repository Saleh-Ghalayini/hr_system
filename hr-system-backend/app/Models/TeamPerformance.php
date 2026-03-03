<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamPerformance extends Model
{
    use SoftDeletes;

    protected $table = 'teams_performance';

    protected $fillable = [
        'user_id',
        'type_id',
        'rate',
        'comment',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(PerformanceType::class, 'type_id');
    }
}
