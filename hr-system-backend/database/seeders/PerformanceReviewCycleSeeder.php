<?php

namespace Database\Seeders;

use App\Models\PerformanceReviewCycle;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PerformanceReviewCycleSeeder extends Seeder
{
    public function run(): void
    {
        $cycles = [
            [
                'name' => 'Q1 2025',
                'type' => 'quarterly',
                'start_date' => Carbon::create(2025, 1, 1),
                'end_date' => Carbon::create(2025, 3, 31),
                'status' => 'closed',
                'description' => 'Q1 2025 quarterly performance review cycle.',
            ],
            [
                'name' => 'Q4 2025',
                'type' => 'quarterly',
                'start_date' => Carbon::create(2025, 10, 1),
                'end_date' => Carbon::create(2025, 12, 31),
                'status' => 'closed',
                'description' => 'Q4 2025 quarterly performance review cycle.',
            ],
            [
                'name' => 'Q1 2026',
                'type' => 'quarterly',
                'start_date' => Carbon::create(2026, 1, 1),
                'end_date' => Carbon::create(2026, 3, 31),
                'status' => 'active',
                'description' => 'Q1 2026 quarterly performance review cycle. Active review period.',
            ],
            [
                'name' => 'Q2 2026',
                'type' => 'quarterly',
                'start_date' => Carbon::create(2026, 4, 1),
                'end_date' => Carbon::create(2026, 6, 30),
                'status' => 'upcoming',
                'description' => 'Q2 2026 quarterly performance review cycle.',
            ],
            [
                'name' => 'Annual 2026',
                'type' => 'annual',
                'start_date' => Carbon::create(2026, 1, 1),
                'end_date' => Carbon::create(2026, 12, 31),
                'status' => 'upcoming',
                'description' => 'Annual performance review for 2026.',
            ],
        ];

        foreach ($cycles as $cycle) {
            PerformanceReviewCycle::updateOrCreate(
                ['name' => $cycle['name']],
                $cycle
            );
        }
    }
}
