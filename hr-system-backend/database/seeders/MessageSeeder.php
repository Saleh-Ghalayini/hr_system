<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('messages')->count() > 0) {
            return;
        }

        // Resolve user IDs by email so the seeder works regardless of auto-increment state
        $adminId    = DB::table('users')->where('role', 'admin')->value('id');
        $manager1Id = DB::table('users')->where('email', 'manager@hr.com')->value('id');
        $manager2Id = DB::table('users')->where('email', 'maya@hr.com')->value('id');
        $emp1Id     = DB::table('users')->where('email', 'hassan@email.com')->value('id');
        $emp2Id     = DB::table('users')->where('email', 'lara@hr.com')->value('id');
        $emp3Id     = DB::table('users')->where('email', 'omar@hr.com')->value('id');

        if (!$adminId || !$manager1Id || !$emp1Id || !$emp2Id) {
            $this->command->warn('MessageSeeder: required users not found, skipping.');
            return;
        }

        // ── Admin → employees: HR portal welcome ──────────────────────
        DB::table('messages')->insert([
            'sender_id'           => $adminId,
            'receiver_id'         => $emp1Id,
            'parent_id'           => null,
            'subject'             => 'Welcome to the new HR Portal',
            'body'                => 'Hi! We are excited to launch the new HR portal. You can now submit leave requests, view your payslips, and track your attendance all in one place. Please explore and let us know if you have any questions.',
            'read_at'             => '2026-01-02 09:15:00',
            'deleted_by_sender'   => false,
            'deleted_by_receiver' => false,
            'created_at'          => '2026-01-01 10:00:00',
            'updated_at'          => '2026-01-01 10:00:00',
        ]);

        DB::table('messages')->insert([
            'sender_id'           => $adminId,
            'receiver_id'         => $emp2Id,
            'parent_id'           => null,
            'subject'             => 'Welcome to the new HR Portal',
            'body'                => 'Hi! We are excited to launch the new HR portal. You can now submit leave requests, view your payslips, and track your attendance all in one place. Please explore and let us know if you have any questions.',
            'read_at'             => '2026-01-02 08:45:00',
            'deleted_by_sender'   => false,
            'deleted_by_receiver' => false,
            'created_at'          => '2026-01-01 10:00:00',
            'updated_at'          => '2026-01-01 10:00:00',
        ]);

        DB::table('messages')->insert([
            'sender_id'           => $adminId,
            'receiver_id'         => $emp3Id,
            'parent_id'           => null,
            'subject'             => 'Welcome to the new HR Portal',
            'body'                => 'Hi! We are excited to launch the new HR portal. You can now submit leave requests, view your payslips, and track your attendance all in one place. Please explore and let us know if you have any questions.',
            'read_at'             => null,
            'deleted_by_sender'   => false,
            'deleted_by_receiver' => false,
            'created_at'          => '2026-01-01 10:00:00',
            'updated_at'          => '2026-01-01 10:00:00',
        ]);

        // ── Employee → Manager: leave question ────────────────────────
        $leaveQuestionId = DB::table('messages')->insertGetId([
            'sender_id'           => $emp1Id,
            'receiver_id'         => $manager1Id,
            'parent_id'           => null,
            'subject'             => 'Leave Request — Annual Leave in April',
            'body'                => 'Hi, I would like to take annual leave from April 14 to April 18. Could you approve this or let me know if there are any conflicts with the team schedule? I have already submitted the formal request through the portal.',
            'read_at'             => '2026-03-10 11:00:00',
            'deleted_by_sender'   => false,
            'deleted_by_receiver' => false,
            'created_at'          => '2026-03-09 14:30:00',
            'updated_at'          => '2026-03-09 14:30:00',
        ]);

        // ── Manager replies ───────────────────────────────────────────
        DB::table('messages')->insert([
            'sender_id'           => $manager1Id,
            'receiver_id'         => $emp1Id,
            'parent_id'           => $leaveQuestionId,
            'subject'             => 'Re: Leave Request — Annual Leave in April',
            'body'                => 'Hi! Approved. April 14–18 looks fine. I have already confirmed it on the system. Enjoy your break!',
            'read_at'             => '2026-03-10 15:00:00',
            'deleted_by_sender'   => false,
            'deleted_by_receiver' => false,
            'created_at'          => '2026-03-10 11:30:00',
            'updated_at'          => '2026-03-10 11:30:00',
        ]);

        // ── Employee → Admin: payslip question ───────────────────────
        $payslipQuestionId = DB::table('messages')->insertGetId([
            'sender_id'           => $emp2Id,
            'receiver_id'         => $adminId,
            'parent_id'           => null,
            'subject'             => 'Question about February Payslip',
            'body'                => 'Hello, I noticed my February payslip shows a deduction I did not expect. Could you please clarify what the "Other Deductions" line item refers to? I would appreciate a breakdown if possible. Thank you.',
            'read_at'             => '2026-03-05 10:00:00',
            'deleted_by_sender'   => false,
            'deleted_by_receiver' => false,
            'created_at'          => '2026-03-04 16:00:00',
            'updated_at'          => '2026-03-04 16:00:00',
        ]);

        // ── Admin replies ─────────────────────────────────────────────
        DB::table('messages')->insert([
            'sender_id'           => $adminId,
            'receiver_id'         => $emp2Id,
            'parent_id'           => $payslipQuestionId,
            'subject'             => 'Re: Question about February Payslip',
            'body'                => 'Hi! The "Other Deductions" line reflects the one-day unpaid leave you took on Feb 12. This is calculated as your daily base rate. Please check your attendance records for confirmation. Let me know if you have further questions.',
            'read_at'             => null,
            'deleted_by_sender'   => false,
            'deleted_by_receiver' => false,
            'created_at'          => '2026-03-05 10:30:00',
            'updated_at'          => '2026-03-05 10:30:00',
        ]);

        // ── Manager → Admin: headcount request ───────────────────────
        DB::table('messages')->insert([
            'sender_id'           => $manager1Id,
            'receiver_id'         => $adminId,
            'parent_id'           => null,
            'subject'             => 'Headcount Request — Q2 2026',
            'body'                => 'Hi, I would like to request one additional frontend developer for Q2. The team is currently at capacity and we have three new client projects starting in April. I can provide a full justification document if needed. Please let me know how to proceed.',
            'read_at'             => null,
            'deleted_by_sender'   => false,
            'deleted_by_receiver' => false,
            'created_at'          => '2026-03-20 09:00:00',
            'updated_at'          => '2026-03-20 09:00:00',
        ]);

        // ── Employee → Employee: project coordination ─────────────────
        $coverCallId = DB::table('messages')->insertGetId([
            'sender_id'           => $emp1Id,
            'receiver_id'         => $emp2Id,
            'parent_id'           => null,
            'subject'             => 'Can you cover the client call Thursday?',
            'body'                => 'Hey, I have a conflict Thursday at 3pm — the client call for Project Phoenix. Are you available to step in? I will send you a full briefing note so you are up to speed. Let me know ASAP.',
            'read_at'             => '2026-03-27 10:00:00',
            'deleted_by_sender'   => false,
            'deleted_by_receiver' => false,
            'created_at'          => '2026-03-26 17:00:00',
            'updated_at'          => '2026-03-26 17:00:00',
        ]);

        DB::table('messages')->insert([
            'sender_id'           => $emp2Id,
            'receiver_id'         => $emp1Id,
            'parent_id'           => $coverCallId,
            'subject'             => 'Re: Can you cover the client call Thursday?',
            'body'                => 'Sure, no problem. Send me the briefing and I will handle it. Good luck with your other meeting!',
            'read_at'             => null,
            'deleted_by_sender'   => false,
            'deleted_by_receiver' => false,
            'created_at'          => '2026-03-27 10:05:00',
            'updated_at'          => '2026-03-27 10:05:00',
        ]);

        // ── Admin → managers: performance review reminder ─────────────
        DB::table('messages')->insert([
            'sender_id'           => $adminId,
            'receiver_id'         => $manager1Id,
            'parent_id'           => null,
            'subject'             => 'Reminder: Performance Evaluations Due March 31',
            'body'                => 'Hi, just a reminder that Q1 performance evaluations for your team are due by March 31. Please ensure all assessments are completed on time. Reach out if you need any support.',
            'read_at'             => '2026-03-25 09:30:00',
            'deleted_by_sender'   => false,
            'deleted_by_receiver' => false,
            'created_at'          => '2026-03-24 09:00:00',
            'updated_at'          => '2026-03-24 09:00:00',
        ]);

        if ($manager2Id) {
            DB::table('messages')->insert([
                'sender_id'           => $adminId,
                'receiver_id'         => $manager2Id,
                'parent_id'           => null,
                'subject'             => 'Reminder: Performance Evaluations Due March 31',
                'body'                => 'Hi, just a reminder that Q1 performance evaluations for your team are due by March 31. Please ensure all assessments are completed on time. Reach out if you need any support.',
                'read_at'             => null,
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-03-24 09:00:00',
                'updated_at'          => '2026-03-24 09:00:00',
            ]);
        }
    }
}
