<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        /*
         * Courses seeded (IDs):
         *   1=React Fundamentals (40h)
         *   2=Laravel Backend Development (60h)
         *   3=Project Management Essentials (24h)
         *   4=HR Compliance & Labor Law (16h)
         *   5=Data Analysis with Excel & Power BI (20h)
         *   6=Leadership & Team Development (32h)
         */
        DB::table('enrollments')->insert([
            // Hassan (3) — React completed, Laravel in-progress
            ['user_id' => 3, 'course_id' => 1, 'start_date' => '2025-09-01', 'end_date' => '2025-11-30', 'status' => 'completed', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 3, 'course_id' => 2, 'start_date' => '2025-12-01', 'end_date' => '2026-03-31', 'status' => 'in_progress', 'created_at' => $now, 'updated_at' => $now],

            // Lara (4) — React completed, Leadership in-progress
            ['user_id' => 4, 'course_id' => 1, 'start_date' => '2025-08-01', 'end_date' => '2025-10-31', 'status' => 'completed', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 4, 'course_id' => 6, 'start_date' => '2026-01-15', 'end_date' => '2026-04-15', 'status' => 'in_progress', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 4, 'course_id' => 3, 'start_date' => '2026-04-20', 'end_date' => '2026-06-20', 'status' => 'enrolled', 'created_at' => $now, 'updated_at' => $now],

            // Omar (5) — Laravel enrolled, Data Analysis enrolled
            ['user_id' => 5, 'course_id' => 2, 'start_date' => '2026-02-01', 'end_date' => '2026-05-31', 'status' => 'enrolled', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 5, 'course_id' => 5, 'start_date' => '2025-10-01', 'end_date' => '2025-12-31', 'status' => 'completed', 'created_at' => $now, 'updated_at' => $now],

            // Nour (6) — React in-progress, HR Compliance enrolled
            ['user_id' => 6, 'course_id' => 1, 'start_date' => '2026-01-01', 'end_date' => '2026-04-30', 'status' => 'in_progress', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 6, 'course_id' => 4, 'start_date' => '2026-03-01', 'end_date' => '2026-04-15', 'status' => 'enrolled', 'created_at' => $now, 'updated_at' => $now],

            // Karim (7) — Laravel enrolled (intern bootcamp)
            ['user_id' => 7, 'course_id' => 2, 'start_date' => '2025-09-01', 'end_date' => '2026-02-28', 'status' => 'in_progress', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 7, 'course_id' => 1, 'start_date' => '2026-03-01', 'end_date' => '2026-06-30', 'status' => 'enrolled', 'created_at' => $now, 'updated_at' => $now],

            // Maya (8) — Leadership completed, Project Management completed
            ['user_id' => 8, 'course_id' => 6, 'start_date' => '2025-06-01', 'end_date' => '2025-09-30', 'status' => 'completed', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 8, 'course_id' => 3, 'start_date' => '2025-10-01', 'end_date' => '2025-12-31', 'status' => 'completed', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 8, 'course_id' => 4, 'start_date' => '2026-01-05', 'end_date' => '2026-03-05', 'status' => 'in_progress', 'created_at' => $now, 'updated_at' => $now],

            // Ali (9) — Laravel completed, React in-progress
            ['user_id' => 9, 'course_id' => 2, 'start_date' => '2025-07-01', 'end_date' => '2025-11-30', 'status' => 'completed', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 9, 'course_id' => 1, 'start_date' => '2025-12-01', 'end_date' => '2026-03-31', 'status' => 'in_progress', 'created_at' => $now, 'updated_at' => $now],

            // Rima (10) — HR Compliance enrolled, Data Analysis enrolled
            ['user_id' => 10, 'course_id' => 4, 'start_date' => '2026-01-15', 'end_date' => '2026-03-15', 'status' => 'in_progress', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 10, 'course_id' => 5, 'start_date' => '2026-03-01', 'end_date' => '2026-05-31', 'status' => 'enrolled', 'created_at' => $now, 'updated_at' => $now],

            // Sara (2) — Leadership completed, Project Management completed
            ['user_id' => 2, 'course_id' => 6, 'start_date' => '2025-04-01', 'end_date' => '2025-07-31', 'status' => 'completed', 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 2, 'course_id' => 4, 'start_date' => '2025-08-01', 'end_date' => '2025-10-31', 'status' => 'completed', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
