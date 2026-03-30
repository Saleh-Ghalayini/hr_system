<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InsuranceSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            ['type' => 'HAF',  'cost' => 50,  'old_cost' => 50],
            ['type' => 'GNA',  'cost' => 70,  'old_cost' => 70],
            ['type' => 'RLDA', 'cost' => 100, 'old_cost' => 100],
        ];

        foreach ($plans as $plan) {
            DB::table('insurances')->updateOrInsert(
                ['type' => $plan['type']],
                array_merge($plan, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
