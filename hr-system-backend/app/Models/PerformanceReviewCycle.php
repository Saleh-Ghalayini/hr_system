<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PerformanceReviewCycle extends Model
{
    protected $fillable = [
        'name',
        'type',
        'start_date',
        'end_date',
        'status',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the performance goals for this review cycle.
     */
    public function goals(): HasMany
    {
        return $this->hasMany(PerformanceGoal::class, 'review_cycle_id');
    }

    /**
     * Get peer reviews for this cycle.
     */
    public function peerReviews(): HasMany
    {
        return $this->hasMany(PeerReview::class, 'review_cycle_id');
    }

    /**
     * Get self assessments for this cycle.
     */
    public function selfAssessments(): HasMany
    {
        return $this->hasMany(SelfAssessment::class, 'review_cycle_id');
    }

    /**
     * Get employee performances for this cycle.
     */
    public function employeePerformances(): HasMany
    {
        return $this->hasMany(EmployeePerformance::class, 'review_cycle_id');
    }

    /**
     * Get team performances for this cycle.
     */
    public function teamPerformances(): HasMany
    {
        return $this->hasMany(TeamPerformance::class, 'review_cycle_id');
    }

    /**
     * Get summaries for this cycle.
     */
    public function summaries(): HasMany
    {
        return $this->hasMany(PerformanceSummary::class, 'review_cycle_id');
    }

    /**
     * Scope for active cycles.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for upcoming cycles.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming');
    }

    /**
     * Check if cycle is currently active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get duration in days.
     */
    public function getDurationInDaysAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date);
    }

    /**
     * Check if a date falls within the cycle.
     */
    public function containsDate($date): bool
    {
        $date = \Carbon\Carbon::parse($date);
        return $date->between($this->start_date, $this->end_date);
    }
}
