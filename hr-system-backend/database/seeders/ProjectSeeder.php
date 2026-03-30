<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('projects')->count() > 0) { return; }

        DB::table('projects')->insert([
            [
                'name'        => 'HR System Migration',
                'description' => 'Migrating the legacy HR system to the new Laravel-based platform, including data migration, API redesign, and frontend rebuild.',
                'created_by'  => 1,
                'status'      => 'active',
                'start_date'  => '2026-01-01',
                'end_date'    => '2026-06-30',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => 'Employee Onboarding Portal',
                'description' => 'Building a self-service onboarding portal for new hires to complete paperwork, upload documents, and review company policies digitally.',
                'created_by'  => 2,
                'status'      => 'active',
                'start_date'  => '2026-02-01',
                'end_date'    => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => 'Annual Compliance Audit 2025',
                'description' => 'End-to-end review of all HR compliance requirements for 2025, including labor law adherence, payroll accuracy, and data protection.',
                'created_by'  => 1,
                'status'      => 'completed',
                'start_date'  => '2025-10-01',
                'end_date'    => '2025-12-31',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => 'Performance Management System Upgrade',
                'description' => 'Upgrading the performance review module with 360-degree feedback, automated scoring, and quarterly review scheduling.',
                'created_by'  => 8,
                'status'      => 'on_hold',
                'start_date'  => '2026-03-01',
                'end_date'    => '2026-09-30',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }
}
