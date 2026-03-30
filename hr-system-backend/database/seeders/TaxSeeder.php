<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaxSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('taxes')->updateOrInsert(
            ['label' => 'Standard Income Tax'],
            ['rate' => 11, 'created_at' => now(), 'updated_at' => now()]
        );
    }
}
