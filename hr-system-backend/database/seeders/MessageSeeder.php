<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // User IDs: 1=admin, 2=manager1(Mustafa), 3=manager2, 4–10=employees
        $messages = [
            // ── Admin → all employees: HR portal announcement ──────────
            [
                'sender_id'           => 1,
                'receiver_id'         => 4,
                'parent_id'           => null,
                'subject'             => 'Welcome to the new HR Portal',
                'body'                => 'Hi! We are excited to launch the new HR portal. You can now submit leave requests, view your payslips, and track your attendance all in one place. Please explore and let us know if you have any questions.',
                'read_at'             => '2026-01-02 09:15:00',
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-01-01 10:00:00',
                'updated_at'          => '2026-01-01 10:00:00',
            ],
            [
                'sender_id'           => 1,
                'receiver_id'         => 5,
                'parent_id'           => null,
                'subject'             => 'Welcome to the new HR Portal',
                'body'                => 'Hi! We are excited to launch the new HR portal. You can now submit leave requests, view your payslips, and track your attendance all in one place. Please explore and let us know if you have any questions.',
                'read_at'             => '2026-01-02 08:45:00',
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-01-01 10:00:00',
                'updated_at'          => '2026-01-01 10:00:00',
            ],
            [
                'sender_id'           => 1,
                'receiver_id'         => 6,
                'parent_id'           => null,
                'subject'             => 'Welcome to the new HR Portal',
                'body'                => 'Hi! We are excited to launch the new HR portal. You can now submit leave requests, view your payslips, and track your attendance all in one place. Please explore and let us know if you have any questions.',
                'read_at'             => null,
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-01-01 10:00:00',
                'updated_at'          => '2026-01-01 10:00:00',
            ],
            // ── Employee → Manager: leave question ─────────────────────
            [
                'sender_id'           => 4,
                'receiver_id'         => 2,
                'parent_id'           => null,
                'subject'             => 'Leave Request — Annual Leave in April',
                'body'                => 'Hi Mustafa, I would like to take annual leave from April 14 to April 18. Could you approve this or let me know if there are any conflicts with the team schedule? I have already submitted the formal request through the portal.',
                'read_at'             => '2026-03-10 11:00:00',
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-03-09 14:30:00',
                'updated_at'          => '2026-03-09 14:30:00',
            ],
            // ── Manager replies to employee ────────────────────────────
            [
                'sender_id'           => 2,
                'receiver_id'         => 4,
                'parent_id'           => 4,
                'subject'             => 'Re: Leave Request — Annual Leave in April',
                'body'                => 'Hi! Approved. April 14–18 looks fine. I have already confirmed it on the system. Enjoy your break!',
                'read_at'             => '2026-03-10 15:00:00',
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-03-10 11:30:00',
                'updated_at'          => '2026-03-10 11:30:00',
            ],
            // ── Employee → HR (admin): payslip question ────────────────
            [
                'sender_id'           => 5,
                'receiver_id'         => 1,
                'parent_id'           => null,
                'subject'             => 'Question about February Payslip',
                'body'                => 'Hello, I noticed my February payslip shows a deduction I did not expect. Could you please clarify what the "Other Deductions" line item refers to? I would appreciate a breakdown if possible. Thank you.',
                'read_at'             => '2026-03-05 10:00:00',
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-03-04 16:00:00',
                'updated_at'          => '2026-03-04 16:00:00',
            ],
            // ── Admin replies ──────────────────────────────────────────
            [
                'sender_id'           => 1,
                'receiver_id'         => 5,
                'parent_id'           => 6,
                'subject'             => 'Re: Question about February Payslip',
                'body'                => 'Hi! The "Other Deductions" line reflects the one-day unpaid leave you took on Feb 12. This is calculated as your daily base rate. Please check your attendance records for confirmation. Let me know if you have further questions.',
                'read_at'             => null,
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-03-05 10:30:00',
                'updated_at'          => '2026-03-05 10:30:00',
            ],
            // ── Manager → Admin: headcount request ────────────────────
            [
                'sender_id'           => 2,
                'receiver_id'         => 1,
                'parent_id'           => null,
                'subject'             => 'Headcount Request — Q2 2026',
                'body'                => 'Hi, I would like to request one additional frontend developer for Q2. The team is currently at capacity and we have three new client projects starting in April. I can provide a full justification document if needed. Please let me know how to proceed.',
                'read_at'             => null,
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-03-20 09:00:00',
                'updated_at'          => '2026-03-20 09:00:00',
            ],
            // ── Employee → Employee: project coordination ──────────────
            [
                'sender_id'           => 4,
                'receiver_id'         => 5,
                'parent_id'           => null,
                'subject'             => 'Can you cover the client call Thursday?',
                'body'                => 'Hey, I have a conflict Thursday at 3pm — the client call for Project Phoenix. Are you available to step in? I will send you a full briefing note so you are up to speed. Let me know ASAP.',
                'read_at'             => '2026-03-27 10:00:00',
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-03-26 17:00:00',
                'updated_at'          => '2026-03-26 17:00:00',
            ],
            [
                'sender_id'           => 5,
                'receiver_id'         => 4,
                'parent_id'           => 9,
                'subject'             => 'Re: Can you cover the client call Thursday?',
                'body'                => 'Sure, no problem. Send me the briefing and I will handle it. Good luck with your other meeting!',
                'read_at'             => null,
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-03-27 10:05:00',
                'updated_at'          => '2026-03-27 10:05:00',
            ],
            // ── Admin → manager: performance review reminder ───────────
            [
                'sender_id'           => 1,
                'receiver_id'         => 2,
                'parent_id'           => null,
                'subject'             => 'Reminder: Performance Evaluations Due March 31',
                'body'                => 'Hi Mustafa, just a reminder that Q1 performance evaluations for your team are due by March 31. Please ensure all assessments are completed on time. Reach out if you need any support.',
                'read_at'             => '2026-03-25 09:30:00',
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-03-24 09:00:00',
                'updated_at'          => '2026-03-24 09:00:00',
            ],
            [
                'sender_id'           => 1,
                'receiver_id'         => 3,
                'parent_id'           => null,
                'subject'             => 'Reminder: Performance Evaluations Due March 31',
                'body'                => 'Hi, just a reminder that Q1 performance evaluations for your team are due by March 31. Please ensure all assessments are completed on time. Reach out if you need any support.',
                'read_at'             => null,
                'deleted_by_sender'   => false,
                'deleted_by_receiver' => false,
                'created_at'          => '2026-03-24 09:00:00',
                'updated_at'          => '2026-03-24 09:00:00',
            ],
        ];

        DB::table('messages')->insert($messages);
    }
}
