<?php

namespace App\Services;

use App\Models\TeamPerformance;
use App\Models\EmployeePerformance;

class PerformanceService
{
    public function rateTeam(int $userId, array $data): array
    {
        $records = [];

        foreach ($data['type_ids'] as $index => $typeId) {
            $records[] = TeamPerformance::create([
                'user_id' => $userId,
                'type_id' => $typeId,
                'rate'    => $data['rate'][$index],
                'comment' => $data['comment'] ?? null,
            ]);
        }

        return $records;
    }

    public function rateEmployee(int $managerId, array $data): array
    {
        $records = [];

        foreach ($data['type_ids'] as $index => $typeId) {
            $records[] = EmployeePerformance::create([
                'user_id'    => $data['user_id'],
                'manager_id' => $managerId,
                'type_id'    => $typeId,
                'rate'       => $data['rate'][$index],
                'comment'    => $data['comment'] ?? null,
            ]);
        }

        return $records;
    }
}
