<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserOnboardingStatus extends Model
{
    protected $table = 'user_onboarding_status';

    protected $fillable = [
        'user_id',
        'is_onboarding_complete',
        'onboarding_started_at',
        'onboarding_completed_at',
    ];

    protected $casts = [
        'is_onboarding_complete' => 'boolean',
        'onboarding_started_at' => 'datetime',
        'onboarding_completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
