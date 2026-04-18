<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserOnboardingDocument extends Model
{
    protected $fillable = [
        'user_id',
        'document_id',
        'file_path',
        'original_name',
        'status',
        'admin_notes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(OnboardingDocument::class, 'document_id');
    }
}
