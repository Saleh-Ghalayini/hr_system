<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class PeerReview extends Model
{
    

    protected $table = 'peer_reviews';

    protected $fillable = [
        'reviewer_id',
        'reviewed_id',
        'review_cycle_id',
        'type_id',
        'rate',
        'comment',
        'relationship',
    ];

    protected $casts = [
        'rate' => 'integer',
    ];

    /**
     * Get the reviewer (person giving feedback).
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Get the reviewed person (person receiving feedback).
     */
    public function reviewed(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_id');
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
     * Get rating label.
     */
    public function getRatingLabelAttribute(): string
    {
        return match($this->rate) {
            1 => 'Needs Significant Improvement',
            2 => 'Needs Improvement',
            3 => 'Meets Some Expectations',
            4 => 'Meets Expectations',
            5 => 'Exceeds Expectations',
            default => 'Unknown',
        };
    }

    /**
     * Scope for reviews received by a user.
     */
    public function scopeReceivedBy($query, int $userId)
    {
        return $query->where('reviewed_id', $userId);
    }

    /**
     * Scope for reviews given by a user.
     */
    public function scopeGivenBy($query, int $userId)
    {
        return $query->where('reviewer_id', $userId);
    }

    /**
     * Scope for a specific cycle.
     */
    public function scopeForCycle($query, int $cycleId)
    {
        return $query->where('review_cycle_id', $cycleId);
    }

    /**
     * Check if reviewer and reviewed are in same team/department.
     */
    public function isSameTeam(): bool
    {
        $reviewer = $this->reviewer;
        $reviewed = $this->reviewed;

        return $reviewer && $reviewed && 
               $reviewer->jobDetails?->department === $reviewed->jobDetails?->department;
    }
}
