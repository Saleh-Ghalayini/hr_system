<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegulationSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('regulations')->count() > 0) { return; }

        $now = now();

        // ── Regulation 1: Lebanese Labor Law ─────────────────────────
        $reg1 = DB::table('regulations')->insertGetId([
            'name'           => 'Labor Law No. 1 of 2010',
            'jurisdiction'   => 'Lebanon',
            'description'    => 'Governs employment contracts, working hours, termination procedures, and employee rights in Lebanon.',
            'effective_date' => '2010-01-01',
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);

        DB::table('regulation_requirements')->insert([
            [
                'regulation_id'     => $reg1,
                'requirement'       => 'Maximum 48 working hours per week for all employees',
                'deadline'          => null,
                'status'            => 'compliant',
                'responsible_party' => 1,
                'created_at'        => $now, 'updated_at' => $now,
            ],
            [
                'regulation_id'     => $reg1,
                'requirement'       => 'Minimum 15 days paid annual leave per year',
                'deadline'          => null,
                'status'            => 'compliant',
                'responsible_party' => 1,
                'created_at'        => $now, 'updated_at' => $now,
            ],
            [
                'regulation_id'     => $reg1,
                'requirement'       => 'Provide end-of-service indemnity equal to one month salary per year of service',
                'deadline'          => '2026-06-30',
                'status'            => 'in_review',
                'responsible_party' => 2,
                'created_at'        => $now, 'updated_at' => $now,
            ],
            [
                'regulation_id'     => $reg1,
                'requirement'       => 'Issue written employment contracts for all full-time employees',
                'deadline'          => null,
                'status'            => 'compliant',
                'responsible_party' => 8,
                'created_at'        => $now, 'updated_at' => $now,
            ],
        ]);

        // ── Regulation 2: GDPR Data Protection ───────────────────────
        $reg2 = DB::table('regulations')->insertGetId([
            'name'           => 'GDPR — General Data Protection Regulation',
            'jurisdiction'   => 'European Union',
            'description'    => 'Comprehensive data protection and privacy regulation applying to any organisation processing personal data of EU residents.',
            'effective_date' => '2018-05-25',
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);

        DB::table('regulation_requirements')->insert([
            [
                'regulation_id'     => $reg2,
                'requirement'       => 'Encrypt all personally identifiable employee data at rest and in transit',
                'deadline'          => '2026-04-30',
                'status'            => 'in_review',
                'responsible_party' => 3,
                'created_at'        => $now, 'updated_at' => $now,
            ],
            [
                'regulation_id'     => $reg2,
                'requirement'       => 'Maintain an up-to-date data processing register',
                'deadline'          => '2026-03-31',
                'status'            => 'non_compliant',
                'responsible_party' => 2,
                'created_at'        => $now, 'updated_at' => $now,
            ],
            [
                'regulation_id'     => $reg2,
                'requirement'       => 'Implement a data breach notification process (72-hour rule)',
                'deadline'          => '2026-05-01',
                'status'            => 'in_review',
                'responsible_party' => 1,
                'created_at'        => $now, 'updated_at' => $now,
            ],
            [
                'regulation_id'     => $reg2,
                'requirement'       => 'Obtain and document explicit consent for marketing communications',
                'deadline'          => null,
                'status'            => 'compliant',
                'responsible_party' => 8,
                'created_at'        => $now, 'updated_at' => $now,
            ],
        ]);

        // ── Regulation 3: Workplace Health & Safety ───────────────────
        $reg3 = DB::table('regulations')->insertGetId([
            'name'           => 'Occupational Health & Safety Standards 2023',
            'jurisdiction'   => 'Lebanon',
            'description'    => 'Regulations governing workplace safety, ergonomics, emergency preparedness, and employee well-being.',
            'effective_date' => '2023-01-01',
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);

        DB::table('regulation_requirements')->insert([
            [
                'regulation_id'     => $reg3,
                'requirement'       => 'Conduct annual workplace safety risk assessment',
                'deadline'          => '2026-12-31',
                'status'            => 'in_review',
                'responsible_party' => 8,
                'created_at'        => $now, 'updated_at' => $now,
            ],
            [
                'regulation_id'     => $reg3,
                'requirement'       => 'Ensure fire safety equipment is inspected every 6 months',
                'deadline'          => '2026-06-30',
                'status'            => 'compliant',
                'responsible_party' => 1,
                'created_at'        => $now, 'updated_at' => $now,
            ],
            [
                'regulation_id'     => $reg3,
                'requirement'       => 'Provide ergonomic workstations for remote employees',
                'deadline'          => '2026-09-01',
                'status'            => 'non_compliant',
                'responsible_party' => 2,
                'created_at'        => $now, 'updated_at' => $now,
            ],
        ]);
    }
}
