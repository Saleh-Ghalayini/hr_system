<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('leave_types')->insert([
            ['name' => 'annual',  'max_days' => 15, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'sick',    'max_days' => 15, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'casual',  'max_days' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'other',   'max_days' => 5,  'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
