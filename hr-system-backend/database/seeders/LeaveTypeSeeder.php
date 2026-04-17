<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('leave_types')->whereIn('name', ['casual', 'other', 'bereavement'])->delete();

        $types = [
            ['name' => 'annual', 'max_days' => 15, 'is_balance_exempt' => false],
            ['name' => 'sick', 'max_days' => 15, 'is_balance_exempt' => false],
            ['name' => 'pto', 'max_days' => 10, 'is_balance_exempt' => false],
            ['name' => 'unpaid', 'max_days' => 0, 'is_balance_exempt' => true],
            ['name' => 'maternity', 'max_days' => 60, 'is_balance_exempt' => false],
            ['name' => 'paternity', 'max_days' => 30, 'is_balance_exempt' => false],
        ];

        foreach ($types as $type) {
            DB::table('leave_types')->updateOrInsert(
                ['name' => $type['name']],
                array_merge($type, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
