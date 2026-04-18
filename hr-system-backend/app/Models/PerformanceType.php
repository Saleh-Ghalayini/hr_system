<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceType extends Model
{
    protected $fillable = [
        'name',
        'weight',
        'description',
    ];

    protected $casts = [
        'weight' => 'integer',
    ];

    public function teamPerformances(): HasMany
    {
        return $this->hasMany(TeamPerformance::class, 'type_id');
    }

    public function employeePerformances(): HasMany
    {
        return $this->hasMany(EmployeePerformance::class, 'type_id');
    }

    public function peerReviews(): HasMany
    {
        return $this->hasMany(PeerReview::class, 'type_id');
    }

    public function selfAssessments(): HasMany
    {
        return $this->hasMany(SelfAssessment::class, 'type_id');
    }

    /**
     * Get the weighted score contribution.
     */
    public function getWeightedValue(int $score): float
    {
        return ($score / 5) * $this->weight;
    }
}
