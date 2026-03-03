<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('projects')->insert([
            [
                'name'        => 'HR System Migration',
                'description' => 'Migrating legacy HR system to the new platform.',
                'created_by'  => 1,
                'status'      => 'active',
                'start_date'  => '2026-01-01',
                'end_date'    => '2026-06-30',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => 'Employee Onboarding Portal',
                'description' => 'Building a self-service onboarding portal for new hires.',
                'created_by'  => 2,
                'status'      => 'active',
                'start_date'  => '2026-02-01',
                'end_date'    => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }
}
