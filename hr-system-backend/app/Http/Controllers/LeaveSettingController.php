<?php

namespace App\Http\Controllers;

use App\Http\Requests\Leave\UpdateLeaveSettingsRequest;
use App\Models\LeaveType;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;

class LeaveSettingController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $types = LeaveType::query()
            ->orderBy('name')
            ->get(['name', 'max_days', 'is_balance_exempt']);

        return $this->success([
            'types' => $types,
        ]);
    }

    public function update(UpdateLeaveSettingsRequest $request)
    {
        $types = $request->validated()['types'];

        DB::transaction(function () use ($types) {
            foreach ($types as $item) {
                LeaveType::query()
                    ->where('name', $item['name'])
                    ->update([
                        'max_days' => (int) $item['max_days'],
                        'is_balance_exempt' => (bool) $item['is_balance_exempt'],
                    ]);
            }
        });

        return $this->success(
            LeaveType::query()
                ->orderBy('name')
                ->get(['name', 'max_days', 'is_balance_exempt']),
            'Leave settings updated successfully.'
        );
    }
}
