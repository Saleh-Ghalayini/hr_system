<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LeaveRequestSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        DB::table('leave_requests')->insert([
            // Hassan — approved annual leave
            [
                'user_id'    => 3,
                'leave_type' => 'annual',
                'start_date' => '2025-12-24',
                'end_date'   => '2025-12-26',
                'status'     => 'approved',
                'reason'     => 'Christmas break',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Hassan — approved sick leave
            [
                'user_id'    => 3,
                'leave_type' => 'sick',
                'start_date' => '2026-01-08',
                'end_date'   => '2026-01-09',
                'status'     => 'approved',
                'reason'     => 'Flu recovery',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Hassan — pending leave request
            [
                'user_id'    => 3,
                'leave_type' => 'casual',
                'start_date' => '2026-03-20',
                'end_date'   => '2026-03-20',
                'status'     => 'pending',
                'reason'     => 'Personal errand',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Lara — approved annual leave
            [
                'user_id'    => 4,
                'leave_type' => 'annual',
                'start_date' => '2026-01-02',
                'end_date'   => '2026-01-04',
                'status'     => 'approved',
                'reason'     => 'New Year holiday extension',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Omar — rejected leave
            [
                'user_id'    => 5,
                'leave_type' => 'annual',
                'start_date' => '2026-01-15',
                'end_date'   => '2026-01-17',
                'status'     => 'rejected',
                'reason'     => 'Family trip',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Omar — pending sick leave
            [
                'user_id'    => 5,
                'leave_type' => 'sick',
                'start_date' => '2026-03-10',
                'end_date'   => '2026-03-11',
                'status'     => 'pending',
                'reason'     => 'Doctor appointment and recovery',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Nour — approved sick leave
            [
                'user_id'    => 6,
                'leave_type' => 'sick',
                'start_date' => '2025-12-15',
                'end_date'   => '2025-12-19',
                'status'     => 'approved',
                'reason'     => 'Illness',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Nour — approved casual
            [
                'user_id'    => 6,
                'leave_type' => 'casual',
                'start_date' => '2026-02-05',
                'end_date'   => '2026-02-06',
                'status'     => 'approved',
                'reason'     => 'Personal matters',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Nour — pending annual
            [
                'user_id'    => 6,
                'leave_type' => 'annual',
                'start_date' => '2026-04-01',
                'end_date'   => '2026-04-07',
                'status'     => 'pending',
                'reason'     => 'Spring vacation',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Maya — approved annual
            [
                'user_id'    => 8,
                'leave_type' => 'annual',
                'start_date' => '2025-12-29',
                'end_date'   => '2026-01-01',
                'status'     => 'approved',
                'reason'     => 'Year-end break',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Ali — approved sick
            [
                'user_id'    => 9,
                'leave_type' => 'sick',
                'start_date' => '2026-01-20',
                'end_date'   => '2026-01-21',
                'status'     => 'approved',
                'reason'     => 'Stomach issues',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Ali — pending other
            [
                'user_id'    => 9,
                'leave_type' => 'other',
                'start_date' => '2026-03-25',
                'end_date'   => '2026-03-25',
                'status'     => 'pending',
                'reason'     => 'Attending a workshop',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Sara manager — approved annual
            [
                'user_id'    => 2,
                'leave_type' => 'annual',
                'start_date' => '2026-02-16',
                'end_date'   => '2026-02-19',
                'status'     => 'approved',
                'reason'     => 'Family visit',
                'created_at' => $now, 'updated_at' => $now,
            ],
            // Karim intern — pending casual
            [
                'user_id'    => 7,
                'leave_type' => 'casual',
                'start_date' => '2026-03-18',
                'end_date'   => '2026-03-18',
                'status'     => 'pending',
                'reason'     => 'University exam',
                'created_at' => $now, 'updated_at' => $now,
            ],
        ]);
    }
}
