<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserOnboardingChecklist extends Model
{
    protected $table = 'user_onboarding_checklist';

    protected $fillable = [
        'user_id',
        'checklist_item_id',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(OnboardingChecklistItem::class, 'checklist_item_id');
    }
}
