<?php

namespace App\Services;

use App\Models\TeamPerformance;
use App\Models\EmployeePerformance;
use App\Models\PerformanceReviewCycle;
use App\Models\PerformanceGoal;
use App\Models\PeerReview;
use App\Models\SelfAssessment;
use App\Models\PerformanceSummary;
use App\Models\PerformanceType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class PerformanceService
{
    // Default weights for 360-degree feedback scoring
    private const DEFAULT_WEIGHTS = [
        'self' => 0.15,
        'manager' => 0.40,
        'peer' => 0.25,
        'team' => 0.20,
    ];

    /**
     * ================================
     * REVIEW CYCLES
     * ================================
     */

    /**
     * Get all review cycles with optional status filter.
     */
    public function getReviewCycles(?string $status = null): Collection
    {
        $query = PerformanceReviewCycle::query()->orderBy('start_date', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    /**
     * Get the current active review cycle.
     */
    public function getActiveCycle(): ?PerformanceReviewCycle
    {
        return PerformanceReviewCycle::where('status', 'active')
            ->orderBy('start_date', 'desc')
            ->orderBy('id', 'desc')
            ->first();
    }

    /**
     * Create a new review cycle.
     */
    public function createReviewCycle(array $data): PerformanceReviewCycle
    {
        return DB::transaction(function () use ($data) {
            return PerformanceReviewCycle::create($data);
        });
    }

    /**
     * ================================
     * TEAM PERFORMANCE (Self-rating team contribution)
     * ================================
     */

    /**
     * Rate own team contribution (1-5 scale).
     */
    public function rateTeam(int $userId, array $data): array
    {
        return DB::transaction(function () use ($userId, $data) {
            $reviewCycleId = $data['review_cycle_id'] ?? $this->getActiveCycle()?->id;
            $records = [];

            foreach ($data['type_ids'] as $index => $typeId) {
                // Check for duplicate in same cycle
                $existing = TeamPerformance::where('user_id', $userId)
                    ->where('type_id', $typeId)
                    ->where('review_cycle_id', $reviewCycleId)
                    ->first();

                if ($existing) {
                    // Update existing record
                    $existing->update([
                        'rate' => $data['rate'][$index],
                        'comment' => $data['comment'] ?? $existing->comment,
                    ]);
                    $records[] = $existing->fresh();
                } else {
                    $records[] = TeamPerformance::create([
                        'user_id' => $userId,
                        'type_id' => $typeId,
                        'rate' => $data['rate'][$index],
                        'comment' => $data['comment'] ?? null,
                        'review_cycle_id' => $reviewCycleId,
                    ]);
                }
            }

            // Update summary if exists
            $this->updateTeamScoreInSummary($userId, $reviewCycleId);

            return $records;
        });
    }

    /**
     * Get latest team ratings for a user.
     */
    public function getLatestTeamRatings(int $userId, ?int $cycleId = null): Collection
    {
        $query = TeamPerformance::with('type:id,name,weight')
            ->where('user_id', $userId);

        if ($cycleId) {
            $query->where('review_cycle_id', $cycleId);
        }

        // Get latest per type
        $latestIds = (clone $query)
            ->selectRaw('MAX(id) as id')
            ->groupBy('type_id');

        return $query->whereIn('id', $latestIds)
            ->orderBy('type_id')
            ->get();
    }

    /**
     * Get team rating history for trend analysis.
     */
    public function getTeamRatingHistory(int $userId, int $limit = 12): Collection
    {
        $cycles = PerformanceReviewCycle::orderBy('start_date', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();

        $history = [];
        foreach ($cycles as $cycle) {
            $ratings = $this->getLatestTeamRatings($userId, $cycle->id);
            $avg = $ratings->avg('rate');

            $history[] = [
                'cycle' => $cycle->name,
                'cycle_id' => $cycle->id,
                'start_date' => $cycle->start_date,
                'average_rate' => $avg ? round($avg, 2) : null,
                'ratings' => $ratings,
            ];
        }

        return collect($history);
    }

    /**
     * ================================
     * EMPLOYEE PERFORMANCE (Manager rating)
     * ================================
     */

    /**
     * Rate an employee (manager only).
     */
    public function rateEmployee(int $managerId, array $data): array
    {
        return DB::transaction(function () use ($managerId, $data) {
            $reviewCycleId = $data['review_cycle_id'] ?? $this->getActiveCycle()?->id;
            $records = [];

            foreach ($data['type_ids'] as $index => $typeId) {
                // Check for duplicate in same cycle
                $existing = EmployeePerformance::where('user_id', $data['user_id'])
                    ->where('manager_id', $managerId)
                    ->where('type_id', $typeId)
                    ->where('review_cycle_id', $reviewCycleId)
                    ->first();

                if ($existing) {
                    $existing->update([
                        'rate' => $data['rate'][$index],
                        'comment' => $data['comment'] ?? $existing->comment,
                    ]);
                    $records[] = $existing->fresh();
                } else {
                    $records[] = EmployeePerformance::create([
                        'user_id' => $data['user_id'],
                        'manager_id' => $managerId,
                        'type_id' => $typeId,
                        'rate' => $data['rate'][$index],
                        'comment' => $data['comment'] ?? null,
                        'review_cycle_id' => $reviewCycleId,
                        'weight' => $data['weights'][$index] ?? 1,
                        'created_date' => Carbon::now(),
                    ]);
                }
            }

            // Update summary
            $this->updateManagerScoreInSummary($data['user_id'], $reviewCycleId, $managerId);

            return $records;
        });
    }

    /**
     * Get employee's latest ratings (from manager).
     */
    public function getEmployeeRatings(int $userId, ?int $cycleId = null): Collection
    {
        $query = EmployeePerformance::with(['type:id,name,weight', 'manager:id,first_name,last_name'])
            ->where('user_id', $userId);

        if ($cycleId) {
            $query->where('review_cycle_id', $cycleId);
        }

        $latestIds = (clone $query)
            ->selectRaw('MAX(id) as id')
            ->groupBy('type_id');

        return $query->whereIn('id', $latestIds)
            ->orderBy('type_id')
            ->get();
    }

    /**
     * Get employee rating history.
     */
    public function getEmployeeRatingHistory(int $userId, int $limit = 12): Collection
    {
        $cycles = PerformanceReviewCycle::orderBy('start_date', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();

        $history = [];
        foreach ($cycles as $cycle) {
            $ratings = $this->getEmployeeRatings($userId, $cycle->id);
            $avg = $ratings->avg('rate');

            $history[] = [
                'cycle' => $cycle->name,
                'cycle_id' => $cycle->id,
                'start_date' => $cycle->start_date,
                'average_rate' => $avg ? round($avg, 2) : null,
                'manager' => $ratings->first()?->manager,
                'ratings' => $ratings,
            ];
        }

        return collect($history);
    }

    /**
     * ================================
     * SELF ASSESSMENT
     * ================================
     */

    /**
     * Submit self-assessment.
     */
    public function submitSelfAssessment(int $userId, array $data): array
    {
        return DB::transaction(function () use ($userId, $data) {
            $reviewCycleId = $data['review_cycle_id'] ?? $this->getActiveCycle()?->id;
            $records = [];

            foreach ($data['type_ids'] as $index => $typeId) {
                $existing = SelfAssessment::where('user_id', $userId)
                    ->where('type_id', $typeId)
                    ->where('review_cycle_id', $reviewCycleId)
                    ->first();

                if ($existing) {
                    $existing->update([
                        'rate' => $data['rate'][$index],
                        'comment' => $data['comments'][$index] ?? null,
                    ]);
                    $records[] = $existing->fresh();
                } else {
                    $records[] = SelfAssessment::create([
                        'user_id' => $userId,
                        'review_cycle_id' => $reviewCycleId,
                        'type_id' => $typeId,
                        'rate' => $data['rate'][$index],
                        'comment' => $data['comments'][$index] ?? null,
                        'accomplishments' => $data['accomplishments'] ?? null,
                        'challenges' => $data['challenges'] ?? null,
                        'development_needs' => $data['development_needs'] ?? null,
                    ]);
                }
            }

            // Update summary
            $this->updateSelfScoreInSummary($userId, $reviewCycleId);

            return $records;
        });
    }

    /**
     * Get self-assessment for a user.
     */
    public function getSelfAssessment(int $userId, ?int $cycleId = null): Collection
    {
        $cycleId = $cycleId ?? $this->getActiveCycle()?->id;

        return SelfAssessment::with('type:id,name,weight')
            ->where('user_id', $userId)
            ->when($cycleId, fn($q) => $q->where('review_cycle_id', $cycleId))
            ->orderBy('type_id')
            ->get();
    }

    /**
     * ================================
     * PEER REVIEWS (360-degree feedback)
     * ================================
     */

    /**
     * Submit peer review.
     */
    public function submitPeerReview(int $reviewerId, array $data): PeerReview
    {
        return DB::transaction(function () use ($reviewerId, $data) {
            $reviewCycleId = $data['review_cycle_id'] ?? $this->getActiveCycle()?->id;

            // Check for existing review
            $existing = PeerReview::where('reviewer_id', $reviewerId)
                ->where('reviewed_id', $data['reviewed_id'])
                ->where('type_id', $data['type_id'])
                ->where('review_cycle_id', $reviewCycleId)
                ->first();

            if ($existing) {
                $existing->update([
                    'rate' => $data['rate'],
                    'comment' => $data['comment'] ?? null,
                    'relationship' => $data['relationship'] ?? $existing->relationship,
                ]);
                $review = $existing->fresh();
            } else {
                $review = PeerReview::create([
                    'reviewer_id' => $reviewerId,
                    'reviewed_id' => $data['reviewed_id'],
                    'review_cycle_id' => $reviewCycleId,
                    'type_id' => $data['type_id'],
                    'rate' => $data['rate'],
                    'comment' => $data['comment'] ?? null,
                    'relationship' => $data['relationship'] ?? 'colleague',
                ]);
            }

            // Update summary
            $this->updatePeerScoreInSummary($data['reviewed_id'], $reviewCycleId);

            return $review;
        });
    }

    /**
     * Get peer reviews received by a user.
     */
    public function getPeerReviewsReceived(int $userId, ?int $cycleId = null): Collection
    {
        return PeerReview::with(['type:id,name', 'reviewer:id,first_name,last_name'])
            ->where('reviewed_id', $userId)
            ->when($cycleId, fn($q) => $q->where('review_cycle_id', $cycleId))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get peer reviews given by a user.
     */
    public function getPeerReviewsGiven(int $userId, ?int $cycleId = null): Collection
    {
        return PeerReview::with(['type:id,name', 'reviewed:id,first_name,last_name'])
            ->where('reviewer_id', $userId)
            ->when($cycleId, fn($q) => $q->where('review_cycle_id', $cycleId))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get average peer rating per type for a user.
     */
    public function getPeerRatingAverages(int $userId, ?int $cycleId = null): Collection
    {
        $query = PeerReview::where('reviewed_id', $userId)
            ->when($cycleId, fn($q) => $q->where('review_cycle_id', $cycleId));

        return $query->selectRaw('type_id, AVG(rate) as average_rate, COUNT(*) as review_count')
            ->groupBy('type_id')
            ->with('type:id,name')
            ->get();
    }

    /**
     * Get colleagues available for peer review.
     */
    public function getPotentialPeers(int $userId): Collection
    {
        $user = User::with('jobDetails')->find($userId);

        if (!$user || !$user->jobDetails) {
            return collect();
        }

        $department = $user->jobDetails->department;

        return User::where('id', '!=', $userId)
            ->whereHas('jobDetails', fn($q) => $q->where('department', $department))
            ->get(['id', 'first_name', 'last_name', 'position']);
    }

    /**
     * ================================
     * GOALS
     * ================================
     */

    /**
     * Create a performance goal.
     */
    public function createGoal(int $userId, array $data): PerformanceGoal
    {
        return DB::transaction(function () use ($userId, $data) {
            return PerformanceGoal::create(array_merge($data, [
                'user_id' => $userId,
                'review_cycle_id' => $data['review_cycle_id'] ?? $this->getActiveCycle()?->id,
            ]));
        });
    }

    /**
     * Update goal progress.
     */
    public function updateGoalProgress(int $goalId, float $currentValue): PerformanceGoal
    {
        $goal = PerformanceGoal::findOrFail($goalId);

        $status = $goal->status;
        if ($currentValue >= $goal->target_value) {
            $status = 'achieved';
        } elseif ($currentValue > 0) {
            $status = 'in_progress';
        }

        $goal->update([
            'current_value' => $currentValue,
            'status' => $status,
        ]);

        return $goal->fresh();
    }

    /**
     * Get goals for a user.
     */
    public function getUserGoals(int $userId, ?int $cycleId = null): Collection
    {
        return PerformanceGoal::with('reviewCycle:id,name')
            ->where('user_id', $userId)
            ->when($cycleId, fn($q) => $q->where('review_cycle_id', $cycleId))
            ->orderBy('due_date')
            ->get();
    }

    /**
     * Calculate overall goal achievement score.
     */
    public function calculateGoalScore(int $userId, ?int $cycleId = null): ?float
    {
        $goals = $this->getUserGoals($userId, $cycleId);

        if ($goals->isEmpty()) {
            return null;
        }

        $totalWeight = $goals->sum('weight');
        $weightedScore = 0;

        foreach ($goals as $goal) {
            $progress = $goal->progress_percentage ?? 0;
            $weightedScore += ($progress / 100) * $goal->weight;
        }

        return round(($weightedScore / $totalWeight) * 5, 2); // Scale to 5
    }

    /**
     * ================================
     * PERFORMANCE SUMMARY
     * ================================
     */

    /**
     * Get or create performance summary.
     */
    public function getPerformanceSummary(int $userId, int $cycleId, ?int $managerId = null): PerformanceSummary
    {
        $summary = PerformanceSummary::where('user_id', $userId)
            ->where('review_cycle_id', $cycleId)
            ->first();

        if (!$summary) {
            $summary = PerformanceSummary::create([
                'user_id' => $userId,
                'review_cycle_id' => $cycleId,
                'manager_id' => $managerId,
                'status' => 'draft',
            ]);
        }

        return $summary;
    }

    /**
     * Get comprehensive performance report.
     */
    public function getPerformanceReport(int $userId, ?int $cycleId = null): array
    {
        $cycleId = $cycleId ?? $this->getActiveCycle()?->id;

        if (!$cycleId) {
            return ['error' => 'No active review cycle'];
        }

        $cycle = PerformanceReviewCycle::find($cycleId);
        $types = PerformanceType::all();

        // Gather all scores
        $selfAssessment = $this->getSelfAssessment($userId, $cycleId);
        $managerRatings = $this->getEmployeeRatings($userId, $cycleId);
        $peerRatings = $this->getPeerRatingAverages($userId, $cycleId);
        $teamRatings = $this->getLatestTeamRatings($userId, $cycleId);
        $goals = $this->getUserGoals($userId, $cycleId);
        $summary = $this->getPerformanceSummary($userId, $cycleId);

        // Calculate weighted scores
        $selfScore = $selfAssessment->avg('rate');
        $managerScore = $managerRatings->avg('rate');
        $peerScore = $peerRatings->avg('average_rate');
        $teamScore = $teamRatings->avg('rate');

        // Build detailed breakdown by type
        $breakdown = [];
        foreach ($types as $type) {
            $breakdown[] = [
                'type' => $type->name,
                'type_id' => $type->id,
                'self' => $selfAssessment->where('type_id', $type->id)->first()?->rate,
                'manager' => $managerRatings->where('type_id', $type->id)->first()?->rate,
                'peer' => $peerRatings->where('type_id', $type->id)->first()?->average_rate,
                'team' => $teamRatings->where('type_id', $type->id)->first()?->rate,
            ];
        }

        return [
            'user_id' => $userId,
            'cycle' => [
                'id' => $cycle->id,
                'name' => $cycle->name,
                'type' => $cycle->type,
                'start_date' => $cycle->start_date,
                'end_date' => $cycle->end_date,
                'status' => $cycle->status,
            ],
            'scores' => [
                'self' => $selfScore ? round($selfScore, 2) : null,
                'manager' => $managerScore ? round($managerScore, 2) : null,
                'peer' => $peerScore ? round($peerScore, 2) : null,
                'team' => $teamScore ? round($teamScore, 2) : null,
                'goals' => $goals->count(),
                'goals_achieved' => $goals->where('status', 'achieved')->count(),
            ],
            'breakdown' => $breakdown,
            'goals' => $goals->map(fn($g) => [
                'id' => $g->id,
                'title' => $g->title,
                'category' => $g->category,
                'status' => $g->status,
                'progress' => $g->progress_percentage,
                'due_date' => $g->due_date,
            ]),
            'summary' => $summary,
            'peer_reviews_received' => $this->getPeerReviewsReceived($userId, $cycleId),
        ];
    }

    /**
     * Get average ratings for admin dashboard.
     */
    public function getAverageRatings(?int $cycleId = null, ?int $departmentId = null): Collection
    {
        $cycleId = $cycleId ?? $this->getActiveCycle()?->id;

        $query = EmployeePerformance::with('type:id,name')
            ->where('review_cycle_id', $cycleId);

        if ($departmentId) {
            $query->whereHas('user.jobDetails', fn($q) => $q->where('department', $departmentId));
        }

        return $query->selectRaw('type_id, AVG(rate) as average_rate, COUNT(DISTINCT user_id) as employee_count')
            ->groupBy('type_id')
            ->orderBy('type_id')
            ->get();
    }

    /**
     * Get team/department performance overview.
     */
    public function getDepartmentOverview(?int $departmentId = null, ?int $cycleId = null): Collection
    {
        $cycleId = $cycleId ?? $this->getActiveCycle()?->id;

        $query = User::with([
            'jobDetails',
            'employeePerformances' => fn($q) =>
            $q->where('review_cycle_id', $cycleId)
        ])->whereIn('role', ['user', 'employee']);

        if ($departmentId) {
            $query->whereHas('jobDetails', fn($q) => $q->where('department', $departmentId));
        }

        return $query->get()->map(function ($user) {
            $ratings = $user->employeePerformances;
            $avgRate = $ratings->avg('rate');

            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'position' => $user->position ?? $user->jobDetails?->title,
                    'department' => $user->jobDetails?->department,
                ],
                'average_rating' => $avgRate ? round($avgRate, 2) : null,
                'rating_count' => $ratings->count(),
                'last_reviewed' => $ratings->max('created_at'),
            ];
        })->sortByDesc('average_rating')->values();
    }

    /**
     * ================================
     * PRIVATE HELPERS
     * ================================
     */

    private function updateSelfScoreInSummary(int $userId, ?int $cycleId): void
    {
        if (!$cycleId) return;

        $avg = SelfAssessment::where('user_id', $userId)
            ->where('review_cycle_id', $cycleId)
            ->avg('rate');

        $summary = $this->getPerformanceSummary($userId, $cycleId);
        $summary->update([
            'self_score' => $avg ? round($avg, 2) : null,
            'status' => $summary->status === 'draft' ? 'self_review' : $summary->status,
        ]);

        $this->recalculateFinalScore($summary);
    }

    private function updateManagerScoreInSummary(int $userId, ?int $cycleId, int $managerId): void
    {
        if (!$cycleId) return;

        $avg = EmployeePerformance::where('user_id', $userId)
            ->where('review_cycle_id', $cycleId)
            ->avg('rate');

        $summary = $this->getPerformanceSummary($userId, $cycleId, $managerId);
        $summary->update([
            'manager_score' => $avg ? round($avg, 2) : null,
            'manager_id' => $managerId,
        ]);

        $this->recalculateFinalScore($summary);
    }

    private function updatePeerScoreInSummary(int $userId, ?int $cycleId): void
    {
        if (!$cycleId) return;

        $avg = PeerReview::where('reviewed_id', $userId)
            ->where('review_cycle_id', $cycleId)
            ->avg('rate');

        $summary = $this->getPerformanceSummary($userId, $cycleId);
        $summary->update([
            'peer_score' => $avg ? round($avg, 2) : null,
        ]);

        $this->recalculateFinalScore($summary);
    }

    private function updateTeamScoreInSummary(int $userId, ?int $cycleId): void
    {
        if (!$cycleId) return;

        $avg = TeamPerformance::where('user_id', $userId)
            ->where('review_cycle_id', $cycleId)
            ->avg('rate');

        $summary = $this->getPerformanceSummary($userId, $cycleId);
        $summary->update([
            'team_score' => $avg ? round($avg, 2) : null,
        ]);

        $this->recalculateFinalScore($summary);
    }

    private function recalculateFinalScore(PerformanceSummary $summary): void
    {
        $weights = self::DEFAULT_WEIGHTS;

        $finalScore = 0;
        $totalWeight = 0;

        if ($summary->self_score) {
            $finalScore += $summary->self_score * $weights['self'];
            $totalWeight += $weights['self'];
        }
        if ($summary->manager_score) {
            $finalScore += $summary->manager_score * $weights['manager'];
            $totalWeight += $weights['manager'];
        }
        if ($summary->peer_score) {
            $finalScore += $summary->peer_score * $weights['peer'];
            $totalWeight += $weights['peer'];
        }
        if ($summary->team_score) {
            $finalScore += $summary->team_score * $weights['team'];
            $totalWeight += $weights['team'];
        }

        if ($totalWeight > 0) {
            $finalScore = $finalScore / $totalWeight * ($weights['self'] + $weights['manager'] + $weights['peer'] + $weights['team']);
        }

        $overallRating = $this->determineOverallRating($finalScore);

        $summary->update([
            'final_score' => round($finalScore, 2),
            'overall_rating' => $overallRating,
        ]);
    }

    private function determineOverallRating(float $score): string
    {
        return match (true) {
            $score >= 4.5 => 'exceptional',
            $score >= 3.5 => 'exceeds_expectations',
            $score >= 2.5 => 'meets_expectations',
            default => 'needs_improvement',
        };
    }
}
