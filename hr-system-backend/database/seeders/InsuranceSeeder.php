<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InsuranceSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('insurances')->insert([
            ['type' => 'HAF',  'cost' => 50,  'old_cost' => 50,  'created_at' => now(), 'updated_at' => now()],
            ['type' => 'GNA',  'cost' => 70,  'old_cost' => 70,  'created_at' => now(), 'updated_at' => now()],
            ['type' => 'RLDA', 'cost' => 100, 'old_cost' => 100, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
