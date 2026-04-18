<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class PerformanceGoal extends Model
{
    

    protected $fillable = [
        'user_id',
        'review_cycle_id',
        'title',
        'description',
        'category',
        'status',
        'target_value',
        'current_value',
        'unit',
        'due_date',
        'weight',
    ];

    protected $casts = [
        'target_value' => 'decimal:2',
        'current_value' => 'decimal:2',
        'due_date' => 'date',
    ];

    /**
     * Get the user who owns this goal.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the review cycle for this goal.
     */
    public function reviewCycle(): BelongsTo
    {
        return $this->belongsTo(PerformanceReviewCycle::class, 'review_cycle_id');
    }

    /**
     * Calculate progress percentage.
     */
    public function getProgressPercentageAttribute(): ?float
    {
        if (!$this->target_value || $this->target_value == 0) {
            return null;
        }

        $progress = ($this->current_value / $this->target_value) * 100;
        return min(100, max(0, round($progress, 1)));
    }

    /**
     * Check if goal is overdue.
     */
    public function getIsOverdueAttribute(): bool
    {
        if (!$this->due_date || $this->status === 'achieved') {
            return false;
        }

        return $this->due_date->isPast();
    }

    /**
     * Get weighted score contribution.
     */
    public function getWeightedScoreAttribute(): ?float
    {
        if (!$this->progress_percentage) {
            return null;
        }

        // Score is progress percentage weighted by goal weight
        return ($this->progress_percentage / 100) * $this->weight;
    }

    /**
     * Scope for user's goals.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for active cycle goals.
     */
    public function scopeForActiveCycle($query)
    {
        return $query->whereHas('reviewCycle', function ($q) {
            $q->where('status', 'active');
        });
    }

    /**
     * Scope for pending goals.
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'in_progress']);
    }
}
