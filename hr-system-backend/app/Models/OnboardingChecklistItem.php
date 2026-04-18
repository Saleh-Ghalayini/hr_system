<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OnboardingChecklistItem extends Model
{
    protected $fillable = [
        'label',
        'category',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function userProgress(): HasMany
    {
        return $this->hasMany(UserOnboardingChecklist::class, 'checklist_item_id');
    }
}
