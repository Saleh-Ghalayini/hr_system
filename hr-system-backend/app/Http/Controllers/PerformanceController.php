<?php

namespace App\Http\Controllers;

use App\Models\EmployeePerformance;
use App\Models\PerformanceType;
use App\Models\TeamPerformance;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PerformanceController extends Controller
{
    use ApiResponse;

    public function rateTeam(Request $request)
    {
        $data = $request->validate([
            'type_ids'   => 'required|array|min:1',
            'type_ids.*' => 'required|exists:performance_types,id',
            'rate'       => 'required|array|min:1',
            'rate.*'     => 'required|integer|between:1,5',
            'comment'    => 'nullable|string|max:1000',
        ]);

        if (count($data['type_ids']) !== count($data['rate'])) {
            return $this->error('The number of type IDs must match the number of ratings.', 422);
        }

        $user    = Auth::user();
        $records = [];

        foreach ($data['type_ids'] as $index => $typeId) {
            $records[] = TeamPerformance::create([
                'user_id' => $user->id,
                'type_id' => $typeId,
                'rate'    => $data['rate'][$index],
                'comment' => $data['comment'] ?? null,
            ]);
        }

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

    public function rateEmployee(Request $request)
    {
        $data = $request->validate([
            'user_id'    => 'required|exists:users,id',
            'type_ids'   => 'required|array|min:1',
            'type_ids.*' => 'required|exists:performance_types,id',
            'rate'       => 'required|array|min:1',
            'rate.*'     => 'required|integer|between:1,5',
            'comment'    => 'nullable|string|max:1000',
        ]);

        if (count($data['type_ids']) !== count($data['rate'])) {
            return $this->error('The number of type IDs must match the number of ratings.', 422);
        }

        $manager = Auth::user();
        $records = [];

        foreach ($data['type_ids'] as $index => $typeId) {
            $records[] = EmployeePerformance::create([
                'user_id'    => $data['user_id'],
                'manager_id' => $manager->id,
                'type_id'    => $typeId,
                'rate'       => $data['rate'][$index],
                'comment'    => $data['comment'] ?? null,
            ]);
        }

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
