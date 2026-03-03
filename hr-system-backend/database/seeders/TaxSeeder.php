<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaxSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('taxes')->insert([
            ['rate' => 11, 'label' => 'Standard Income Tax', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
