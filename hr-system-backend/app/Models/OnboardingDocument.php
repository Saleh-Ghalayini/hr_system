<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OnboardingDocument extends Model
{
    protected $fillable = [
        'name',
        'icon',
        'status',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function userDocuments(): HasMany
    {
        return $this->hasMany(UserOnboardingDocument::class, 'document_id');
    }
}
