<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RecruitmentSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // ── Job Openings ──────────────────────────────────────────────
        // Note: migration enum is 'open' | 'closed' | 'draft'
        DB::table('job_openings')->insert([
            [
                'title'       => 'Senior Backend Developer',
                'department'  => 'Engineering',
                'description' => 'We are looking for an experienced Laravel/PHP backend developer to join our growing engineering team. You will design scalable APIs, mentor junior developers, and lead backend architecture decisions.',
                'status'      => 'open',
                'posted_by'   => 1,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'Frontend React Developer',
                'department'  => 'Engineering',
                'description' => 'Join our frontend team to build responsive, accessible, and performant user interfaces using React 19 and modern tooling. Experience with Tailwind and MUI is a plus.',
                'status'      => 'open',
                'posted_by'   => 2,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'HR Specialist',
                'department'  => 'Human Resources',
                'description' => 'Responsible for end-to-end recruitment, onboarding, employee relations, payroll support, and ensuring HR compliance with labor regulations.',
                'status'      => 'closed',
                'posted_by'   => 1,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'Data Analyst',
                'department'  => 'Business Intelligence',
                'description' => 'Analyse company data to generate actionable insights. Work with Power BI, Excel, and SQL to produce dashboards and reports for management.',
                'status'      => 'open',
                'posted_by'   => 8,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'DevOps Engineer',
                'department'  => 'Infrastructure',
                'description' => 'Manage CI/CD pipelines, containerised deployments, cloud infrastructure on AWS, and ensure 99.9% uptime for all production services.',
                'status'      => 'draft',
                'posted_by'   => 1,
                'created_at'  => $now, 'updated_at' => $now,
            ],
        ]);

        // ── Candidates ────────────────────────────────────────────────
        DB::table('candidates')->insert([
            ['name' => 'Alice Johnson',    'email' => 'alice.johnson@gmail.com',    'phone' => '+1555001001', 'resume_path' => 'resumes/alice_johnson.pdf',    'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Bob Smith',        'email' => 'bob.smith@gmail.com',        'phone' => '+1555001002', 'resume_path' => 'resumes/bob_smith.pdf',        'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Clara Nguyen',     'email' => 'clara.nguyen@gmail.com',     'phone' => '+1555001003', 'resume_path' => 'resumes/clara_nguyen.pdf',     'created_at' => $now, 'updated_at' => $now],
            ['name' => 'David Okeke',      'email' => 'david.okeke@gmail.com',      'phone' => '+1555001004', 'resume_path' => null,                          'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Eva Müller',       'email' => 'eva.muller@gmail.com',       'phone' => '+1555001005', 'resume_path' => 'resumes/eva_muller.pdf',       'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Fadi Haddad',      'email' => 'fadi.haddad@gmail.com',      'phone' => '+96171001001','resume_path' => 'resumes/fadi_haddad.pdf',      'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Grace Kim',        'email' => 'grace.kim@gmail.com',        'phone' => '+1555001007', 'resume_path' => 'resumes/grace_kim.pdf',        'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Hani Saleh',       'email' => 'hani.saleh@gmail.com',       'phone' => '+96171001002','resume_path' => null,                          'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ines Cabrera',     'email' => 'ines.cabrera@gmail.com',     'phone' => '+1555001009', 'resume_path' => 'resumes/ines_cabrera.pdf',     'created_at' => $now, 'updated_at' => $now],
            ['name' => 'James Okonkwo',   'email' => 'james.okonkwo@gmail.com',    'phone' => '+1555001010', 'resume_path' => 'resumes/james_okonkwo.pdf',    'created_at' => $now, 'updated_at' => $now],
        ]);

        // ── Job Applications ──────────────────────────────────────────
        // Migration status enum: 'applied' | 'interviewed' | 'hired' | 'rejected'
        DB::table('job_applications')->insert([
            // Senior Backend Developer (opening 1)
            ['candidate_id' => 1, 'job_opening_id' => 1, 'status' => 'hired',       'interview_date' => '2026-01-15 10:00:00', 'notes' => 'Strong candidate, excellent Laravel experience. Offer accepted.',   'created_at' => $now, 'updated_at' => $now],
            ['candidate_id' => 2, 'job_opening_id' => 1, 'status' => 'rejected',    'interview_date' => '2026-01-16 11:00:00', 'notes' => 'Good skills but lacks senior-level experience.',                    'created_at' => $now, 'updated_at' => $now],
            ['candidate_id' => 6, 'job_opening_id' => 1, 'status' => 'interviewed', 'interview_date' => '2026-01-20 14:00:00', 'notes' => 'Second round scheduled.',                                           'created_at' => $now, 'updated_at' => $now],
            // Frontend React Developer (opening 2)
            ['candidate_id' => 3, 'job_opening_id' => 2, 'status' => 'applied',     'interview_date' => null,                  'notes' => 'Resume under review.',                                              'created_at' => $now, 'updated_at' => $now],
            ['candidate_id' => 5, 'job_opening_id' => 2, 'status' => 'interviewed', 'interview_date' => '2026-02-05 09:30:00', 'notes' => 'Very strong React skills. Awaiting technical assessment.',          'created_at' => $now, 'updated_at' => $now],
            ['candidate_id' => 7, 'job_opening_id' => 2, 'status' => 'rejected',    'interview_date' => '2026-02-06 10:00:00', 'notes' => 'Not the right fit for the team culture.',                           'created_at' => $now, 'updated_at' => $now],
            // HR Specialist (opening 3 — closed)
            ['candidate_id' => 8, 'job_opening_id' => 3, 'status' => 'hired',       'interview_date' => '2025-11-10 09:00:00', 'notes' => 'Great HR background. Position filled.',                             'created_at' => $now, 'updated_at' => $now],
            ['candidate_id' => 4, 'job_opening_id' => 3, 'status' => 'rejected',    'interview_date' => '2025-11-08 11:00:00', 'notes' => 'Lacked compliance knowledge.',                                      'created_at' => $now, 'updated_at' => $now],
            // Data Analyst (opening 4)
            ['candidate_id' => 9, 'job_opening_id' => 4, 'status' => 'applied',     'interview_date' => null,                  'notes' => null,                                                               'created_at' => $now, 'updated_at' => $now],
            ['candidate_id' => 10,'job_opening_id' => 4, 'status' => 'interviewed', 'interview_date' => '2026-02-18 14:00:00', 'notes' => 'Impressive Power BI portfolio. Moving to final round.',             'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
