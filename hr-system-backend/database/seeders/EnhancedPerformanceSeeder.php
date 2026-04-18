<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EnhancedPerformanceSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('performance_goals')->count() > 0) {
            return;
        }

        $q4CycleId = DB::table('performance_review_cycles')
            ->where('name', 'Q4 2025')
            ->value('id');
        $q1CycleId = DB::table('performance_review_cycles')
            ->where('name', 'Q1 2026')
            ->value('id');

        if (!$q4CycleId || !$q1CycleId) {
            return;
        }

        $now = now();
        $users = [3, 4, 5, 6, 7, 9, 10];

        $goals = [];
        $selfAssessments = [];
        $summaries = [];
        $peerReviews = [];

        foreach ($users as $userId) {
            // Q4 2025 Goals
            $goals[] = [
                'user_id' => $userId,
                'review_cycle_id' => $q4CycleId,
                'title' => 'Complete Q4 Deliverables',
                'description' => 'Finish all assigned tasks for the fourth quarter.',
                'category' => 'kpi',
                'status' => 'achieved',
                'target_value' => 100,
                'current_value' => 100,
                'unit' => '%',
                'due_date' => '2025-12-31',
                'weight' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            // Q1 2026 Goals
            $goals[] = [
                'user_id' => $userId,
                'review_cycle_id' => $q1CycleId,
                'title' => 'Complete Q1 Deliverables',
                'description' => 'Finish all assigned tasks for the first quarter.',
                'category' => 'kpi',
                'status' => 'achieved',
                'target_value' => 100,
                'current_value' => 100,
                'unit' => '%',
                'due_date' => '2026-03-30',
                'weight' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ];
            $goals[] = [
                'user_id' => $userId,
                'review_cycle_id' => $q1CycleId,
                'title' => 'Improve Technical Skills',
                'description' => 'Take 2 new courses.',
                'category' => 'development',
                'status' => 'in_progress',
                'target_value' => 2,
                'current_value' => 1,
                'unit' => 'courses',
                'due_date' => '2026-06-30',
                'weight' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            // Self Assessments for Q4 2025
            for ($typeId = 1; $typeId <= 6; $typeId++) {
                $selfAssessments[] = [
                    'user_id' => $userId,
                    'review_cycle_id' => $q4CycleId,
                    'type_id' => $typeId,
                    'rate' => rand(3, 5),
                    'comment' => 'I feel I did well in this area.',
                    'accomplishments' => 'Met all deadlines.',
                    'challenges' => 'Some blockers along the way.',
                    'development_needs' => 'More training.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Self Assessments for Q1 2026
            for ($typeId = 1; $typeId <= 6; $typeId++) {
                $selfAssessments[] = [
                    'user_id' => $userId,
                    'review_cycle_id' => $q1CycleId,
                    'type_id' => $typeId,
                    'rate' => rand(3, 5),
                    'comment' => 'I feel I did well in this area.',
                    'accomplishments' => 'Met all deadlines.',
                    'challenges' => 'Some blockers along the way.',
                    'development_needs' => 'More training.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Summary for Q4 2025
            $managerId = in_array($userId, [9, 10]) ? 8 : 2;
            $summaries[] = [
                'user_id' => $userId,
                'manager_id' => $managerId,
                'review_cycle_id' => $q4CycleId,
                'self_score' => rand(35, 48) / 10,
                'manager_score' => rand(35, 50) / 10,
                'peer_score' => rand(35, 48) / 10,
                'team_score' => rand(35, 50) / 10,
                'final_score' => rand(38, 48) / 10,
                'overall_rating' => 'meets_expectations',
                'manager_feedback' => 'Good performance overall this quarter.',
                'employee_comments' => 'Looking forward to the next quarter.',
                'status' => 'completed',
                'completed_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            // Summary for Q1 2026
            $summaries[] = [
                'user_id' => $userId,
                'manager_id' => $managerId,
                'review_cycle_id' => $q1CycleId,
                'self_score' => rand(35, 48) / 10,
                'manager_score' => rand(35, 50) / 10,
                'peer_score' => rand(35, 48) / 10,
                'team_score' => rand(35, 50) / 10,
                'final_score' => rand(38, 48) / 10,
                'overall_rating' => 'meets_expectations',
                'manager_feedback' => 'Good performance overall this quarter.',
                'employee_comments' => 'Looking forward to the next quarter.',
                'status' => 'completed',
                'completed_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            // Peer Reviews for Q4 2025
            $reviewer = $userId === 4 ? 3 : 4; // Arbitrary peer
            for ($typeId = 1; $typeId <= 6; $typeId++) {
                $peerReviews[] = [
                    'reviewer_id' => $reviewer,
                    'reviewed_id' => $userId,
                    'review_cycle_id' => $q4CycleId,
                    'type_id' => $typeId,
                    'rate' => rand(3, 5),
                    'comment' => 'Great to work with.',
                    'relationship' => 'colleague',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Peer Reviews for Q1 2026
            for ($typeId = 1; $typeId <= 6; $typeId++) {
                $peerReviews[] = [
                    'reviewer_id' => $reviewer,
                    'reviewed_id' => $userId,
                    'review_cycle_id' => $q1CycleId,
                    'type_id' => $typeId,
                    'rate' => rand(3, 5),
                    'comment' => 'Great to work with.',
                    'relationship' => 'colleague',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('performance_goals')->insert($goals);
        DB::table('self_assessments')->insert($selfAssessments);
        DB::table('performance_summaries')->insert($summaries);
        DB::table('peer_reviews')->insert($peerReviews);
    }
}
