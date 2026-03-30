<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('announcements')->count() > 0) {
            return;
        }

        $now = now();
        $adminId = DB::table('users')->where('role', 'admin')->value('id') ?? 1;

        DB::table('announcements')->insert([
            [
                'author_id'    => $adminId,
                'title'        => 'Welcome to the New HR Portal',
                'body'         => 'We are excited to announce the launch of our new HR management portal. You can now manage your attendance, leaves, payroll, and more — all from one place. Please explore the new features and report any issues to HR.',
                'type'         => 'info',
                'is_pinned'    => true,
                'target_role'  => null,
                'published_at' => '2026-01-01 08:00:00',
                'expires_at'   => null,
                'created_at'   => $now,
                'updated_at'   => $now,
                'deleted_at'   => null,
            ],
            [
                'author_id'    => $adminId,
                'title'        => 'Q1 2026 Performance Reviews — Deadline March 31',
                'body'         => 'All managers are required to complete Q1 performance evaluations for their direct reports by March 31, 2026. Employees should review their self-assessments and submit them before March 25. Contact HR if you need any guidance on the process.',
                'type'         => 'warning',
                'is_pinned'    => true,
                'target_role'  => 'manager',
                'published_at' => '2026-03-01 09:00:00',
                'expires_at'   => '2026-03-31 23:59:00',
                'created_at'   => $now,
                'updated_at'   => $now,
                'deleted_at'   => null,
            ],
            [
                'author_id'    => $adminId,
                'title'        => 'Office Closure — April 18 (Good Friday)',
                'body'         => 'Please be advised that the office will be closed on Friday, April 18, 2026 in observance of Good Friday. All employees will resume work on Monday, April 21. Emergency contacts remain available during the closure.',
                'type'         => 'info',
                'is_pinned'    => false,
                'target_role'  => null,
                'published_at' => '2026-04-01 08:00:00',
                'expires_at'   => '2026-04-19 00:00:00',
                'created_at'   => $now,
                'updated_at'   => $now,
                'deleted_at'   => null,
            ],
            [
                'author_id'    => $adminId,
                'title'        => 'URGENT: VPN Policy Update — Action Required',
                'body'         => 'Effective immediately, all remote employees must connect through the company VPN when accessing internal systems. Non-compliance will result in access revocation. Please install the updated VPN client available on the IT portal and verify your connection before your next remote session.',
                'type'         => 'urgent',
                'is_pinned'    => true,
                'target_role'  => null,
                'published_at' => '2026-03-10 10:00:00',
                'expires_at'   => null,
                'created_at'   => $now,
                'updated_at'   => $now,
                'deleted_at'   => null,
            ],
            [
                'author_id'    => $adminId,
                'title'        => 'New Training Courses Available — Spring 2026',
                'body'         => 'Six new training courses have been added to our catalog for Spring 2026, covering Leadership Fundamentals, Advanced Excel, Project Management, and more. Enrollment is open. Managers should encourage their teams to complete at least one course by end of Q2.',
                'type'         => 'info',
                'is_pinned'    => false,
                'target_role'  => null,
                'published_at' => '2026-03-15 09:00:00',
                'expires_at'   => '2026-06-30 23:59:00',
                'created_at'   => $now,
                'updated_at'   => $now,
                'deleted_at'   => null,
            ],
            [
                'author_id'    => $adminId,
                'title'        => 'Payroll Processing Delay — March 2026',
                'body'         => 'Due to a system upgrade, March 2026 payroll processing will be delayed by two business days. Salaries will be deposited by April 4, 2026 instead of April 2. We apologize for any inconvenience. For urgent concerns, contact the Finance department directly.',
                'type'         => 'warning',
                'is_pinned'    => false,
                'target_role'  => 'employee',
                'published_at' => '2026-03-28 11:00:00',
                'expires_at'   => '2026-04-05 00:00:00',
                'created_at'   => $now,
                'updated_at'   => $now,
                'deleted_at'   => null,
            ],
            [
                'author_id'    => $adminId,
                'title'        => 'Manager Briefing — Q2 Goals & Strategy',
                'body'         => 'A mandatory manager briefing is scheduled for April 3, 2026 at 10:00 AM in Conference Room B. Agenda: Q1 review, Q2 targets, headcount planning, and budget allocation. Please come prepared with your department KPIs. An invite has been sent to your calendar.',
                'type'         => 'info',
                'is_pinned'    => false,
                'target_role'  => 'manager',
                'published_at' => '2026-03-25 09:00:00',
                'expires_at'   => '2026-04-03 12:00:00',
                'created_at'   => $now,
                'updated_at'   => $now,
                'deleted_at'   => null,
            ],
        ]);
    }
}
