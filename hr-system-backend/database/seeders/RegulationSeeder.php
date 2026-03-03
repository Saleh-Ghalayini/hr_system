<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegulationSeeder extends Seeder
{
    public function run(): void
    {
        $regulationId = DB::table('regulations')->insertGetId([
            'name'           => 'Labor Law No. 1 of 2010',
            'jurisdiction'   => 'Lebanon',
            'description'    => 'Governs employment contracts, working hours, and employee rights.',
            'effective_date' => '2010-01-01',
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        DB::table('regulation_requirements')->insert([
            [
                'regulation_id'    => $regulationId,
                'requirement'      => 'Maximum 48 working hours per week',
                'deadline'         => null,
                'status'           => 'compliant',
                'responsible_party'=> 1,
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'regulation_id'    => $regulationId,
                'requirement'      => 'Minimum 15 days annual leave per year',
                'deadline'         => null,
                'status'           => 'compliant',
                'responsible_party'=> 1,
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
        ]);
    }
}
