<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PerformanceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name' => 'Team Work',
                'weight' => 3,
                'description' => 'Ability to work effectively within a team, contribute to group goals, and support colleagues.',
            ],
            [
                'name' => 'Communication',
                'weight' => 3,
                'description' => 'Effectiveness in sharing information, listening, and articulating ideas clearly.',
            ],
            [
                'name' => 'Problem Solving',
                'weight' => 3,
                'description' => 'Analytical thinking, identifying issues, and implementing effective solutions.',
            ],
            [
                'name' => 'Collaboration',
                'weight' => 2,
                'description' => 'Cross-functional cooperation and building relationships across departments.',
            ],
            [
                'name' => 'Creativity',
                'weight' => 2,
                'description' => 'Innovation, thinking outside the box, and bringing new ideas to the table.',
            ],
            [
                'name' => 'Reliability',
                'weight' => 3,
                'description' => 'Consistency in delivering quality work, meeting deadlines, and being dependable.',
            ],
            [
                'name' => 'Leadership',
                'weight' => 2,
                'description' => 'Ability to guide, motivate, and influence others toward shared objectives.',
            ],
            [
                'name' => 'Technical Skills',
                'weight' => 3,
                'description' => 'Job-specific technical competencies and domain knowledge.',
            ],
        ];

        foreach ($types as $type) {
            DB::table('performance_types')->updateOrInsert(
                ['name' => $type['name']],
                [
                    'weight' => $type['weight'],
                    'description' => $type['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
