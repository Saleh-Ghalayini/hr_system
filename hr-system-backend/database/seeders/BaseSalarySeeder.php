<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BaseSalarySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('base_salaries')->insert([
            ['position' => 'Intern',    'salary' => 300,  'created_at' => now(), 'updated_at' => now()],
            ['position' => 'Junior',    'salary' => 800,  'created_at' => now(), 'updated_at' => now()],
            ['position' => 'Senior',    'salary' => 1600, 'created_at' => now(), 'updated_at' => now()],
            ['position' => 'Executive', 'salary' => 2100, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
