<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BaseSalarySeeder extends Seeder
{
    public function run(): void
    {
        $positions = [
            ['position' => 'Intern',    'salary' => 300],
            ['position' => 'Junior',    'salary' => 800],
            ['position' => 'Senior',    'salary' => 1600],
            ['position' => 'Executive', 'salary' => 2100],
        ];

        foreach ($positions as $row) {
            DB::table('base_salaries')->updateOrInsert(
                ['position' => $row['position']],
                array_merge($row, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
