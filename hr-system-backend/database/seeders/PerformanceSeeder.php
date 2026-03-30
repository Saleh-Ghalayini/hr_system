<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PerformanceSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('teams_performance')->count() > 0) { return; }

        $now = now();

        /*
         * performance_types (seeded in order):
         *   1=Team Work, 2=Communication, 3=Problem-Handling,
         *   4=Collaboration, 5=Creativity, 6=Reliability
         *
         * teams_performance  → user_id = the RATER (employee rating their own team)
         * employees_performance → user_id = EMPLOYEE being rated, manager_id = manager who rates
         */

        // ── teams_performance ─────────────────────────────────────────
        // Employees rate their team (6 types, 2 rounds per employee)
        $teamRaters = [
            // [user_id, rates[], comment, date]
            [3, [4, 4, 3, 5, 3, 4], 'Good collaboration overall, some communication gaps.',   '2025-12-31'],
            [4, [5, 5, 4, 5, 4, 5], 'Excellent team performance this quarter.',               '2025-12-31'],
            [5, [3, 4, 3, 4, 3, 4], 'Average performance, needs improvement in creativity.',  '2025-12-31'],
            [6, [4, 3, 4, 4, 5, 4], 'Creative and collaborative team.',                       '2025-12-31'],
            [7, [4, 4, 4, 4, 4, 4], 'Solid and consistent performance.',                      '2025-12-31'],
            [9, [5, 4, 5, 4, 5, 5], 'Outstanding in problem handling and reliability.',       '2025-12-31'],
           [10, [3, 3, 3, 4, 3, 3], 'Still learning, decent start.',                         '2025-12-31'],
            // Second round (Q1 2026)
            [3, [5, 4, 4, 5, 4, 5], 'Great improvement in teamwork.',                        '2026-03-01'],
            [4, [5, 5, 5, 5, 5, 5], 'Perfect scores — exceptional quarter.',                 '2026-03-01'],
            [5, [4, 4, 3, 4, 4, 4], 'Steady progress.',                                      '2026-03-01'],
            [6, [4, 4, 4, 4, 5, 4], 'Maintained high creativity.',                           '2026-03-01'],
            [9, [5, 5, 5, 5, 5, 5], 'Exceptional across all dimensions.',                    '2026-03-01'],
        ];

        $teamRows = [];
        foreach ($teamRaters as [$userId, $rates, $comment, $date]) {
            foreach ($rates as $typeId => $rate) {
                $teamRows[] = [
                    'user_id'    => $userId,
                    'type_id'    => $typeId + 1,
                    'rate'       => $rate,
                    'comment'    => $comment,
                    'created_at' => $date . ' 00:00:00',
                    'updated_at' => $date . ' 00:00:00',
                ];
            }
        }
        DB::table('teams_performance')->insert($teamRows);

        // ── employees_performance ─────────────────────────────────────
        // Managers rate their direct reports (user_id=employee, manager_id=their manager)
        $empRatings = [
            // [employee_id, manager_id, rates[], comment, created_date]
            // Sara (manager 2) rates Hassan, Lara, Omar, Nour, Karim
            [3, 2, [4, 4, 3, 4, 3, 4], 'Reliable and collaborative. Needs to improve creativity.',  '2025-12-31'],
            [4, 2, [5, 5, 5, 5, 4, 5], 'Outstanding in all areas. A strong performer.',             '2025-12-31'],
            [5, 2, [3, 4, 3, 3, 3, 4], 'Average performance. Should be more proactive.',            '2025-12-31'],
            [6, 2, [4, 4, 4, 4, 5, 4], 'Creative and dependable. Great communication.',             '2025-12-31'],
            [7, 2, [3, 3, 3, 3, 3, 3], 'Intern — still ramping up. Showing promise.',               '2025-12-31'],
            // Maya (manager 8) rates Ali, Rima
            [9, 8, [5, 4, 5, 5, 4, 5], 'Exceptional backend developer. Problem-solving is top-tier.','2025-12-31'],
           [10, 8, [3, 3, 3, 4, 3, 3], 'New intern, learning fast.',                               '2025-12-31'],
            // Q1 2026 round
            [3, 2, [5, 4, 4, 5, 4, 5], 'Significant improvement this quarter.',                    '2026-03-01'],
            [4, 2, [5, 5, 5, 5, 5, 5], 'Perfect performance.',                                     '2026-03-01'],
            [5, 2, [4, 4, 4, 4, 3, 4], 'Better than last quarter. Keep it up.',                    '2026-03-01'],
            [6, 2, [5, 4, 4, 5, 5, 5], 'Excellent quarter.',                                       '2026-03-01'],
            [9, 8, [5, 5, 5, 5, 5, 5], 'Continues to exceed expectations.',                        '2026-03-01'],
           [10, 8, [4, 3, 4, 4, 3, 4], 'Noticeable progress since joining.',                      '2026-03-01'],
        ];

        $empRows = [];
        foreach ($empRatings as [$empId, $managerId, $rates, $comment, $date]) {
            foreach ($rates as $typeId => $rate) {
                $empRows[] = [
                    'user_id'      => $empId,
                    'manager_id'   => $managerId,
                    'type_id'      => $typeId + 1,
                    'rate'         => $rate,
                    'comment'      => $comment,
                    'created_date' => $date,
                    'created_at'   => $date . ' 00:00:00',
                    'updated_at'   => $date . ' 00:00:00',
                ];
            }
        }
        DB::table('employees_performance')->insert($empRows);
    }
}
