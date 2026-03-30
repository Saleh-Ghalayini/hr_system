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
        $query = Holiday::query()->orderBy('date');

        if ($year = $request->query('year')) {
            $query->whereYear('date', $year);
        } else {
            // Default: current + next year
            $query->whereYear('date', '>=', now()->year);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        return $this->success($query->get());
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
