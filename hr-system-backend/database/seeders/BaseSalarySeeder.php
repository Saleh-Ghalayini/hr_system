<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BaseSalarySeeder extends Seeder
{
    
    public function run(): void{
        
        DB::table('base_salaries')->insert([
            [
                "position"=>'Junior',
                "salary" => 800,
            ],
            [
                "position" => 'Senior',
                "salary" => 1600,
            ],
            [
                "position" => 'Intern',
                "salary" => 300,
            ],
            [
                "position" => 'Executive',
                "salary" => 2100,
            ]
        ]);
        
    }
}
