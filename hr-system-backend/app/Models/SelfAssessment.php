<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class SelfAssessment extends Model
{
    

    protected $fillable = [
        'user_id',
        'review_cycle_id',
        'type_id',
        'rate',
        'comment',
        'accomplishments',
        'challenges',
        'development_needs',
    ];

    protected $casts = [
        'rate' => 'integer',
    ];

    /**
     * Get the user who created this self-assessment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the review cycle.
     */
    public function reviewCycle(): BelongsTo
    {
        return $this->belongsTo(PerformanceReviewCycle::class, 'review_cycle_id');
    }

    /**
     * Get the performance type.
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(PerformanceType::class, 'type_id');
    }

    /**
     * Scope for a specific user's assessments.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for a specific cycle.
     */
    public function scopeForCycle($query, int $cycleId)
    {
        return $query->where('review_cycle_id', $cycleId);
    }

    /**
     * Calculate the average rate across all types.
     */
    public static function calculateAverageForUserAndCycle(int $userId, ?int $cycleId = null): ?float
    {
        $query = self::where('user_id', $userId);
        
        if ($cycleId) {
            $query->where('review_cycle_id', $cycleId);
        }

        $avg = $query->avg('rate');
        return $avg ? round($avg, 2) : null;
    }

    /**
     * Check if self-assessment is complete for all types.
     */
    public function scopeComplete($query)
    {
        return $query->whereNotNull('rate')
                     ->where('rate', '>', 0);
    }
}
