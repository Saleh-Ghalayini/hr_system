<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Services\PerformanceService;
use App\Traits\ApiResponse;
use App\Http\Requests\Performance\RateTeamRequest;
use App\Http\Requests\Performance\RateEmployeeRequest;
use App\Models\PerformanceType;
use App\Models\TeamPerformance;
use App\Models\EmployeePerformance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class PerformanceController extends Controller
{
    use ApiResponse;

    public function __construct(private PerformanceService $performanceService) {}

    public function rateTeam(RateTeamRequest $request)
    {
        $records = $this->performanceService->rateTeam(Auth::id(), $request->validated());

        return $this->created($records, 'Team ratings submitted successfully.');
    }

    public function getLastTeamRate()
    {
        $userId = Auth::id();

        // Subquery: latest row ID per type for this user
        $latestIds = TeamPerformance::selectRaw('MAX(id) as id')
            ->where('user_id', $userId)
            ->groupBy('type_id');

        $latestRates = TeamPerformance::with('type:id,name')
            ->whereIn('id', $latestIds)
            ->orderBy('type_id')
            ->get();

        return $this->success($latestRates);
    }

    public function getTypes()
    {
        return $this->success(
            Cache::remember('performance_types', 3600, fn () => PerformanceType::all())
        );
    }

    public function rateEmployee(RateEmployeeRequest $request)
    {
        $records = $this->performanceService->rateEmployee(Auth::id(), $request->validated());

        return $this->created($records, 'Employee ratings submitted successfully.');
    }

    public function getEmployeRate()
    {
        $userId = Auth::id();

        // Subquery: latest row ID per type for this user
        $latestIds = EmployeePerformance::selectRaw('MAX(id) as id')
            ->where('user_id', $userId)
            ->groupBy('type_id');

        $latestRatings = EmployeePerformance::with('type:id,name')
            ->whereIn('id', $latestIds)
            ->orderBy('type_id')
            ->get();

        return $this->success([
            'ratings' => $latestRatings,
            'comment' => $latestRatings->first()?->comment,
        ]);
    }

    public function getAverageRate()
    {
        $averages = EmployeePerformance::with('type:id,name')
            ->selectRaw('type_id, AVG(rate) as average_rate')
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy('type_id')
            ->orderBy('type_id')
            ->get();

        return $this->success($averages);
    }
}
