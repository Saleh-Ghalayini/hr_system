<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'annual',  'max_days' => 15],
            ['name' => 'sick',    'max_days' => 15],
            ['name' => 'casual',  'max_days' => 10],
            ['name' => 'other',   'max_days' => 5],
        ];

        foreach ($types as $type) {
            DB::table('leave_types')->updateOrInsert(
                ['name' => $type['name']],
                array_merge($type, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
