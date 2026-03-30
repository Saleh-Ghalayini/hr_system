<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PerformanceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = ['Team Work', 'Communication', 'Problem-Handling', 'Collaboration', 'Creativity', 'Reliability'];

        foreach ($types as $name) {
            DB::table('performance_types')->updateOrInsert(
                ['name' => $name],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
