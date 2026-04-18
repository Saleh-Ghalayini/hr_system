<?php

namespace App\Http\Controllers;

use App\Services\PerformanceService;
use App\Traits\ApiResponse;
use App\Http\Requests\Performance\RateTeamRequest;
use App\Http\Requests\Performance\RateEmployeeRequest;
use App\Models\PerformanceType;
use App\Models\TeamPerformance;
use App\Models\EmployeePerformance;
use App\Models\PerformanceReviewCycle;
use App\Models\PerformanceGoal;
use App\Models\PeerReview;
use App\Models\SelfAssessment;
use App\Models\PerformanceSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class PerformanceController extends Controller
{
    use ApiResponse;

    public function __construct(private PerformanceService $performanceService) {}

    /**
     * ================================
     * TYPES & CYCLES
     * ================================
     */

    /**
     * Get all performance types.
     * GET /api/v1/performance/types
     */
    public function getTypes()
    {
        $types = Cache::remember('performance_types', 3600, fn () => 
            PerformanceType::all()
        );

        return $this->success($types);
    }

    /**
     * Get review cycles.
     * GET /api/v1/performance/cycles
     */
    public function getCycles(Request $request)
    {
        $status = $request->query('status');
        $cycles = $this->performanceService->getReviewCycles($status);

        return $this->success($cycles);
    }

    /**
     * Get current active cycle.
     * GET /api/v1/performance/cycles/active
     */
    public function getActiveCycle()
    {
        $cycle = $this->performanceService->getActiveCycle();

        if (!$cycle) {
            return $this->error('No active review cycle', 404);
        }

        return $this->success($cycle);
    }

    /**
     * ================================
     * TEAM PERFORMANCE (Self-rating)
     * ================================
     */

    /**
     * Rate own team contribution.
     * POST /api/v1/performance/rate-team
     */
    public function rateTeam(RateTeamRequest $request)
    {
        $records = $this->performanceService->rateTeam(Auth::id(), $request->validated());

        return $this->created($records, 'Team ratings submitted successfully.');
    }

    /**
     * Get latest team ratings.
     * GET /api/v1/performance/my-team-rate
     */
    public function getLastTeamRate(Request $request)
    {
        $cycleId = $request->query('cycle_id');
        $history = $request->boolean('include_history', false);

        if ($history) {
            $ratings = $this->performanceService->getTeamRatingHistory(Auth::id());
        } else {
            $ratings = $this->performanceService->getLatestTeamRatings(Auth::id(), $cycleId);
        }

        return $this->success([
            'ratings' => $ratings,
            'average' => $ratings instanceof \Illuminate\Support\Collection 
                ? $ratings->avg('rate') 
                : null,
        ]);
    }

    /**
     * ================================
     * EMPLOYEE PERFORMANCE (Manager rating)
     * ================================
     */

    /**
     * Rate an employee (manager/admin only).
     * POST /api/v1/performance/rate-employee
     */
    public function rateEmployee(RateEmployeeRequest $request)
    {
        // Verify manager/admin role
        $user = Auth::user();
        if (!in_array($user->role, ['manager', 'admin'])) {
            return $this->error('Only managers and admins can rate employees.', 403);
        }

        $records = $this->performanceService->rateEmployee(Auth::id(), $request->validated());

        return $this->created($records, 'Employee rated successfully.');
    }

    /**
     * Get employee's own ratings (from manager).
     * GET /api/v1/performance/my-rate
     */
    public function getEmployeRate(Request $request)
    {
        $cycleId = $request->query('cycle_id');
        $includeHistory = $request->boolean('include_history', false);

        if ($includeHistory) {
            $history = $this->performanceService->getEmployeeRatingHistory(Auth::id());
            return $this->success(['history' => $history]);
        }

        $ratings = $this->performanceService->getEmployeeRatings(Auth::id(), $cycleId);

        return $this->success([
            'ratings' => $ratings,
            'average' => $ratings->avg('rate'),
            'comment' => $ratings->first()?->comment,
        ]);
    }

    /**
     * Get average ratings (admin dashboard).
     * GET /api/v1/performance/average
     */
    public function getAverageRate(Request $request)
    {
        $cycleId = $request->query('cycle_id');
        $departmentId = $request->query('department_id');

        $averages = $this->performanceService->getAverageRatings($cycleId, $departmentId);

        return $this->success($averages);
    }

    /**
     * ================================
     * SELF ASSESSMENT
     * ================================
     */

    /**
     * Submit self-assessment.
     * POST /api/v1/performance/self-assessment
     */
    public function submitSelfAssessment(Request $request)
    {
        $validated = $request->validate([
            'type_ids' => 'required|array|min:1',
            'type_ids.*' => 'required|exists:performance_types,id',
            'rate' => 'required|array|min:1',
            'rate.*' => 'required|integer|between:1,5',
            'comments' => 'nullable|array',
            'comments.*' => 'nullable|string|max:1000',
            'review_cycle_id' => 'nullable|exists:performance_review_cycles,id',
            'accomplishments' => 'nullable|string|max:5000',
            'challenges' => 'nullable|string|max:5000',
            'development_needs' => 'nullable|string|max:5000',
        ]);

        // Validate array lengths match
        if (count($validated['type_ids']) !== count($validated['rate'])) {
            return $this->error('The number of ratings must match the number of type IDs.', 422);
        }

        $records = $this->performanceService->submitSelfAssessment(Auth::id(), $validated);

        return $this->created($records, 'Self-assessment submitted successfully.');
    }

    /**
     * Get self-assessment.
     * GET /api/v1/performance/self-assessment
     */
    public function getSelfAssessment(Request $request)
    {
        $cycleId = $request->query('cycle_id');
        $assessment = $this->performanceService->getSelfAssessment(Auth::id(), $cycleId);

        return $this->success([
            'assessment' => $assessment,
            'average' => $assessment->avg('rate'),
        ]);
    }

    /**
     * ================================
     * PEER REVIEWS (360-degree)
     * ================================
     */

    /**
     * Submit peer review.
     * POST /api/v1/performance/peer-review
     */
    public function submitPeerReview(Request $request)
    {
        $validated = $request->validate([
            'reviewed_id' => 'required|exists:users,id',
            'type_id' => 'required|exists:performance_types,id',
            'rate' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
            'relationship' => 'nullable|in:colleague,direct_report,cross_functional,client',
            'review_cycle_id' => 'nullable|exists:performance_review_cycles,id',
        ]);

        // Can't review yourself
        if ($validated['reviewed_id'] === Auth::id()) {
            return $this->error('You cannot review yourself.', 422);
        }

        $review = $this->performanceService->submitPeerReview(Auth::id(), $validated);

        return $this->created($review, 'Peer review submitted successfully.');
    }

    /**
     * Get peer reviews received.
     * GET /api/v1/performance/peer-reviews/received
     */
    public function getPeerReviewsReceived(Request $request)
    {
        $cycleId = $request->query('cycle_id');
        $reviews = $this->performanceService->getPeerReviewsReceived(Auth::id(), $cycleId);

        return $this->success([
            'reviews' => $reviews,
            'average' => $reviews->avg('rate'),
            'by_type' => $this->performanceService->getPeerRatingAverages(Auth::id(), $cycleId),
        ]);
    }

    /**
     * Get peer reviews given.
     * GET /api/v1/performance/peer-reviews/given
     */
    public function getPeerReviewsGiven(Request $request)
    {
        $cycleId = $request->query('cycle_id');
        $reviews = $this->performanceService->getPeerReviewsGiven(Auth::id(), $cycleId);

        return $this->success($reviews);
    }

    /**
     * Get potential peers for review.
     * GET /api/v1/performance/peers
     */
    public function getPotentialPeers()
    {
        $peers = $this->performanceService->getPotentialPeers(Auth::id());

        return $this->success($peers);
    }

    /**
     * ================================
     * GOALS
     * ================================
     */

    /**
     * Create a goal.
     * POST /api/v1/performance/goals
     */
    public function createGoal(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category' => 'nullable|in:kpi,development,project,behavioral',
            'target_value' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'due_date' => 'nullable|date|after:today',
            'weight' => 'nullable|integer|min:1|max:10',
            'review_cycle_id' => 'nullable|exists:performance_review_cycles,id',
        ]);

        $goal = $this->performanceService->createGoal(Auth::id(), $validated);

        return $this->created($goal, 'Goal created successfully.');
    }

    /**
     * Get user's goals.
     * GET /api/v1/performance/goals
     */
    public function getGoals(Request $request)
    {
        $cycleId = $request->query('cycle_id');
        $goals = $this->performanceService->getUserGoals(Auth::id(), $cycleId);

        return $this->success([
            'goals' => $goals,
            'stats' => [
                'total' => $goals->count(),
                'achieved' => $goals->where('status', 'achieved')->count(),
                'in_progress' => $goals->where('status', 'in_progress')->count(),
                'pending' => $goals->where('status', 'pending')->count(),
                'overdue' => $goals->where('is_overdue', true)->count(),
            ],
        ]);
    }

    /**
     * Update goal progress.
     * PUT /api/v1/performance/goals/{id}/progress
     */
    public function updateGoalProgress(Request $request, int $id)
    {
        $validated = $request->validate([
            'current_value' => 'required|numeric|min:0',
        ]);

        $goal = PerformanceGoal::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$goal) {
            return $this->error('Goal not found.', 404);
        }

        $updatedGoal = $this->performanceService->updateGoalProgress($id, $validated['current_value']);

        return $this->success($updatedGoal, 'Goal progress updated.');
    }

    /**
     * Delete a goal.
     * DELETE /api/v1/performance/goals/{id}
     */
    public function deleteGoal(int $id)
    {
        $goal = PerformanceGoal::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$goal) {
            return $this->error('Goal not found.', 404);
        }

        $goal->delete();

        return $this->success(null, 'Goal deleted.');
    }

    /**
     * ================================
     * PERFORMANCE SUMMARY & REPORT
     * ================================
     */

    /**
     * Get comprehensive performance report.
     * GET /api/v1/performance/report
     */
    public function getReport(Request $request)
    {
        $cycleId = $request->query('cycle_id');
        $report = $this->performanceService->getPerformanceReport(Auth::id(), $cycleId);

        if (isset($report['error'])) {
            return $this->error($report['error'], 404);
        }

        return $this->success($report);
    }

    /**
     * Get my performance summary.
     * GET /api/v1/performance/summary
     */
    public function getSummary(Request $request)
    {
        $cycleId = $request->query('cycle_id') ?? $this->performanceService->getActiveCycle()?->id;

        if (!$cycleId) {
            return $this->error('No active review cycle.', 404);
        }

        $summary = $this->performanceService->getPerformanceSummary(Auth::id(), $cycleId);

        return $this->success($summary);
    }

    /**
     * ================================
     * ADMIN ENDPOINTS
     * ================================
     */

    /**
     * Create review cycle (admin only).
     * POST /api/v1/admin/performance/cycles
     */
    public function createCycle(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|in:quarterly,annual,probation,project',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'nullable|in:upcoming,active,closed',
            'description' => 'nullable|string|max:2000',
        ]);

        // Only one active cycle at a time
        if (($validated['status'] ?? 'upcoming') === 'active') {
            PerformanceReviewCycle::where('status', 'active')->update(['status' => 'closed']);
        }

        $cycle = $this->performanceService->createReviewCycle($validated);

        return $this->created($cycle, 'Review cycle created.');
    }

    /**
     * Update review cycle (admin only).
     * PUT /api/v1/admin/performance/cycles/{id}
     */
    public function updateCycle(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|in:quarterly,annual,probation,project',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|in:upcoming,active,closed',
            'description' => 'nullable|string|max:2000',
        ]);

        $cycle = PerformanceReviewCycle::find($id);
        if (!$cycle) {
            return $this->error('Review cycle not found.', 404);
        }

        // Only one active cycle at a time
        if (isset($validated['status']) && $validated['status'] === 'active') {
            PerformanceReviewCycle::where('status', 'active')
                ->where('id', '!=', $id)
                ->update(['status' => 'closed']);
        }

        $cycle->update($validated);

        return $this->success($cycle->fresh(), 'Review cycle updated.');
    }

    /**
     * Get department overview (admin/manager).
     * GET /api/v1/admin/performance/department-overview
     */
    public function getDepartmentOverview(Request $request)
    {
        $cycleId = $request->query('cycle_id');
        $departmentId = $request->query('department_id');

        $overview = $this->performanceService->getDepartmentOverview($departmentId, $cycleId);

        return $this->success($overview);
    }

    /**
     * Get employee summary for manager review.
     * GET /api/v1/admin/performance/employee/{id}/summary
     */
    public function getEmployeeSummary(Request $request, int $id)
    {
        $cycleId = $request->query('cycle_id') ?? $this->performanceService->getActiveCycle()?->id;

        if (!$cycleId) {
            return $this->error('No active review cycle.', 404);
        }

        $summary = $this->performanceService->getPerformanceSummary($id, $cycleId);
        $report = $this->performanceService->getPerformanceReport($id, $cycleId);

        return $this->success([
            'summary' => $summary,
            'report' => $report,
        ]);
    }

    /**
     * Submit manager final review.
     * POST /api/v1/admin/performance/employee/{id}/finalize
     */
    public function finalizeReview(Request $request, int $id)
    {
        $validated = $request->validate([
            'manager_feedback' => 'required|string|max:5000',
            'overall_rating' => 'nullable|in:needs_improvement,meets_expectations,exceeds_expectations,exceptional',
        ]);

        $cycleId = $request->query('cycle_id') ?? $this->performanceService->getActiveCycle()?->id;

        if (!$cycleId) {
            return $this->error('No active review cycle.', 404);
        }

        $summary = $this->performanceService->getPerformanceSummary($id, $cycleId, Auth::id());
        
        $summary->update([
            'manager_feedback' => $validated['manager_feedback'],
            'overall_rating' => $validated['overall_rating'] ?? $summary->overall_rating,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return $this->success($summary->fresh(), 'Review finalized.');
    }
}
