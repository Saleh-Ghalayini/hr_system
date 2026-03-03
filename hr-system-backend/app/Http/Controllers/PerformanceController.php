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
        $user = Auth::user();

        $latestRates = TeamPerformance::where('user_id', $user->id)
            ->with('type:id,name')
            ->orderBy('type_id')
            ->orderByDesc('created_at')
            ->get()
            ->unique('type_id')
            ->sortBy('type_id')
            ->values();

        return $this->success($latestRates);
    }

    public function getTypes()
    {
        return $this->success(PerformanceType::all());
    }

    public function rateEmployee(RateEmployeeRequest $request)
    {
        $records = $this->performanceService->rateEmployee(Auth::id(), $request->validated());

        return $this->created($records, 'Employee ratings submitted successfully.');
    }

    public function getEmployeRate(Request $request)
    {
        $userId = $request->filled('user_id') ? $request->user_id : Auth::id();

        $latestRatings = EmployeePerformance::where('user_id', $userId)
            ->with('type:id,name')
            ->orderBy('type_id')
            ->orderByDesc('created_at')
            ->get()
            ->unique('type_id')
            ->sortBy('type_id')
            ->values();

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
