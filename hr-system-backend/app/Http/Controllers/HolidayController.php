<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    use ApiResponse;

    /** GET /holidays — all authenticated users */
    public function index(Request $request)
    {
        $query = Holiday::query();

        if ($year = $request->query('year')) {
            $query->where(function ($q) use ($year) {
                $q->whereYear('date', $year)
                    ->orWhere(function ($q2) use ($year) {
                        $q2->where('is_recurring', true)
                            ->whereYear('date', '<=', $year);
                    });
            });
        } else {
            // Default: current + next year
            $query->where(function ($q) {
                $q->whereYear('date', '>=', now()->year)
                    ->orWhere('is_recurring', true);
            });
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $holidays = $query->get();

        // Adjust dates for recurring holidays to match the requested view
        $targetYear = (int) $request->query('year', now()->year);
        $holidays->transform(function ($holiday) use ($targetYear) {
            if ($holiday->is_recurring) {
                $date = \Carbon\Carbon::parse($holiday->date);
                if ($date->year < $targetYear) {
                    $date->year = $targetYear;
                    $holiday->date = $date->format('Y-m-d');
                }
            }
            return $holiday;
        });

        // Sort them by the newly assigned dates
        $holidays = $holidays->sortBy('date')->values();

        return $this->success($holidays);
    }

    /** POST /admin/holidays */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'date'         => 'required|date',
            'type'         => 'required|in:public,company',
            'is_recurring' => 'boolean',
            'description'  => 'nullable|string|max:500',
        ]);

        $holiday = Holiday::create($data);

        return $this->created($holiday, 'Holiday created successfully.');
    }

    /** PUT /admin/holidays/{holiday} */
    public function update(Request $request, Holiday $holiday)
    {
        $data = $request->validate([
            'name'         => 'sometimes|string|max:255',
            'date'         => 'sometimes|date',
            'type'         => 'sometimes|in:public,company',
            'is_recurring' => 'sometimes|boolean',
            'description'  => 'nullable|string|max:500',
        ]);

        $holiday->update($data);

        return $this->success($holiday, 'Holiday updated successfully.');
    }

    /** DELETE /admin/holidays/{holiday} */
    public function destroy(Holiday $holiday)
    {
        $holiday->delete();

        return $this->success(null, 'Holiday deleted successfully.');
    }
}
