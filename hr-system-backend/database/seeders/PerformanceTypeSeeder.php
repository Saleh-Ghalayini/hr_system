<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class PerformanceTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $performanceTypes = [
            ['name' => 'Team work'],
            ['name' => 'Communication'],
            ['name' => 'Problem-Handling'],
            ['name' => 'Collaboration'],
            ['name' => 'Creativity'],
            ['name' => 'ٌReliability'],
        ];

        DB::table('performance_types')->insert($performanceTypes);
    }
}
