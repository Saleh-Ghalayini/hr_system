<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class PerformanceSummary extends Model
{
    

    protected $fillable = [
        'user_id',
        'manager_id',
        'review_cycle_id',
        'self_score',
        'manager_score',
        'peer_score',
        'team_score',
        'final_score',
        'overall_rating',
        'manager_feedback',
        'employee_comments',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'self_score' => 'decimal:2',
        'manager_score' => 'decimal:2',
        'peer_score' => 'decimal:2',
        'team_score' => 'decimal:2',
        'final_score' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the employee being reviewed.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reviewing manager.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the review cycle.
     */
    public function reviewCycle(): BelongsTo
    {
        return $this->belongsTo(PerformanceReviewCycle::class, 'review_cycle_id');
    }

    /**
     * Calculate final score based on weighted components.
     * Default weights: self=15%, manager=40%, peer=25%, team=20%
     */
    public function calculateFinalScore(
        float $selfWeight = 0.15,
        float $managerWeight = 0.40,
        float $peerWeight = 0.25,
        float $teamWeight = 0.20
    ): ?float {
        $totalWeight = ($this->self_score ? $selfWeight : 0) +
                       ($this->manager_score ? $managerWeight : 0) +
                       ($this->peer_score ? $peerWeight : 0) +
                       ($this->team_score ? $teamWeight : 0);

        if ($totalWeight == 0) {
            return null;
        }

        $weightedScore = 0;
        
        if ($this->self_score) {
            $weightedScore += ($this->self_score * $selfWeight) / $totalWeight * ($selfWeight + $managerWeight + $peerWeight + $teamWeight);
        }
        if ($this->manager_score) {
            $weightedScore += ($this->manager_score * $managerWeight) / $totalWeight * ($selfWeight + $managerWeight + $peerWeight + $teamWeight);
        }
        if ($this->peer_score) {
            $weightedScore += ($this->peer_score * $peerWeight) / $totalWeight * ($selfWeight + $managerWeight + $peerWeight + $teamWeight);
        }
        if ($this->team_score) {
            $weightedScore += ($this->team_score * $teamWeight) / $totalWeight * ($selfWeight + $managerWeight + $peerWeight + $teamWeight);
        }

        return round($weightedScore, 2);
    }

    /**
     * Determine overall rating based on final score.
     */
    public function determineOverallRating(?float $threshold4 = 4.5, ?float $threshold3 = 3.5, ?float $threshold2 = 2.5): ?string
    {
        if (!$this->final_score) {
            return null;
        }

        return match(true) {
            $this->final_score >= $threshold4 => 'exceptional',
            $this->final_score >= $threshold3 => 'exceeds_expectations',
            $this->final_score >= $threshold2 => 'meets_expectations',
            default => 'needs_improvement',
        };
    }

    /**
     * Check if review is complete.
     */
    public function isComplete(): bool
    {
        return $this->status === 'completed' && $this->completed_at !== null;
    }

    /**
     * Get score breakdown as array.
     */
    public function getScoreBreakdownAttribute(): array
    {
        return [
            'self' => $this->self_score,
            'manager' => $this->manager_score,
            'peer' => $this->peer_score,
            'team' => $this->team_score,
            'final' => $this->final_score,
            'rating' => $this->overall_rating,
        ];
    }

    /**
     * Scope for user's summaries.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for manager's reviews.
     */
    public function scopeManagedBy($query, int $managerId)
    {
        return $query->where('manager_id', $managerId);
    }

    /**
     * Scope for pending reviews.
     */
    public function scopePending($query)
    {
        return $query->whereNotIn('status', ['completed']);
    }
}
