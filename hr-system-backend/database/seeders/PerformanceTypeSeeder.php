<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PerformanceTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('performance_types')->insert([
            ['name' => 'Team Work',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Communication',    'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Problem-Handling', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Collaboration',    'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Creativity',       'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Reliability',      'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
