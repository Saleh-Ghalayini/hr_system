<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('tasks')->count() > 0) { return; }

        $now = now();

        /*
         * Projects seeded by ProjectSeeder (IDs):
         *   1 = HR System Migration      (created_by=1, admin)
         *   2 = Employee Onboarding Portal (created_by=2, manager Sara)
         *
         * Task status: todo | in_progress | blocked | done
         * Task priority: low | medium | high
         */
        $tasks = DB::table('tasks')->insertGetId([
            // ── Project 1: HR System Migration ───────────────────────
            'title'       => 'Audit legacy HR database schema',
            'description' => 'Map all existing tables, identify FK relationships, and document columns that need migration.',
            'due_date'    => '2026-01-31',
            'priority'    => 'high',
            'status'      => 'done',
            'assigned_to' => 3,   // Hassan
            'project_id'  => 1,
            'created_by'  => 1,
            'created_at'  => $now, 'updated_at' => $now,
        ]);

        DB::table('tasks')->insert([
            [
                'title'       => 'Design new database ERD',
                'description' => 'Create an entity-relationship diagram for the migrated HR system using draw.io.',
                'due_date'    => '2026-02-15',
                'priority'    => 'high',
                'status'      => 'done',
                'assigned_to' => 4,  // Lara
                'project_id'  => 1,
                'created_by'  => 1,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'Write migration scripts for users table',
                'description' => 'Convert legacy user records to the new schema format including soft-deletes and JWT support.',
                'due_date'    => '2026-02-28',
                'priority'    => 'high',
                'status'      => 'in_progress',
                'assigned_to' => 3,  // Hassan
                'project_id'  => 1,
                'created_by'  => 2,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'Migrate payroll historical records',
                'description' => 'Bulk import 3 years of payroll history from the old system to the new payrolls table.',
                'due_date'    => '2026-03-31',
                'priority'    => 'medium',
                'status'      => 'todo',
                'assigned_to' => 5,  // Omar
                'project_id'  => 1,
                'created_by'  => 2,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'UAT — test all migrated endpoints',
                'description' => 'Run end-to-end testing on the migrated platform. Verify data integrity and API correctness.',
                'due_date'    => '2026-04-30',
                'priority'    => 'high',
                'status'      => 'todo',
                'assigned_to' => 9,  // Ali
                'project_id'  => 1,
                'created_by'  => 1,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            // ── Project 2: Employee Onboarding Portal ─────────────────
            [
                'title'       => 'Design onboarding portal wireframes',
                'description' => 'Create high-fidelity Figma wireframes for the self-service employee onboarding portal.',
                'due_date'    => '2026-02-10',
                'priority'    => 'medium',
                'status'      => 'done',
                'assigned_to' => 4,  // Lara (UX)
                'project_id'  => 2,
                'created_by'  => 2,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'Implement onboarding step-1: personal info form',
                'description' => 'Build the React form for new hire personal information collection with validation.',
                'due_date'    => '2026-03-01',
                'priority'    => 'high',
                'status'      => 'in_progress',
                'assigned_to' => 6,  // Nour (frontend)
                'project_id'  => 2,
                'created_by'  => 2,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'Implement onboarding step-2: document upload',
                'description' => 'Allow new hires to upload ID, contract, and supporting documents during onboarding.',
                'due_date'    => '2026-03-15',
                'priority'    => 'medium',
                'status'      => 'todo',
                'assigned_to' => 6,  // Nour
                'project_id'  => 2,
                'created_by'  => 2,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'Backend API: new-hire onboarding endpoints',
                'description' => 'Create POST /onboarding/submit, GET /onboarding/status, and related endpoints.',
                'due_date'    => '2026-03-10',
                'priority'    => 'high',
                'status'      => 'in_progress',
                'assigned_to' => 3,  // Hassan
                'project_id'  => 2,
                'created_by'  => 2,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'Write integration tests for onboarding flow',
                'description' => 'Cover happy path and edge cases for the onboarding API and React form interactions.',
                'due_date'    => '2026-03-31',
                'priority'    => 'medium',
                'status'      => 'todo',
                'assigned_to' => 9,  // Ali
                'project_id'  => 2,
                'created_by'  => 2,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            // ── Standalone tasks (no project) ─────────────────────────
            [
                'title'       => 'Update employee handbook 2026',
                'description' => 'Revise company policies, add remote-work guidelines, and update PTO policy.',
                'due_date'    => '2026-02-28',
                'priority'    => 'low',
                'status'      => 'done',
                'assigned_to' => 8,  // Maya
                'project_id'  => null,
                'created_by'  => 1,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'Renew office insurance policy',
                'description' => 'Contact RLDA and GNA to renew workplace and employee insurance contracts for 2026.',
                'due_date'    => '2026-01-31',
                'priority'    => 'high',
                'status'      => 'done',
                'assigned_to' => 1,  // Admin
                'project_id'  => null,
                'created_by'  => 1,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'Schedule Q1 performance review sessions',
                'description' => 'Coordinate with all managers to schedule individual performance review meetings for Q1 2026.',
                'due_date'    => '2026-03-15',
                'priority'    => 'medium',
                'status'      => 'in_progress',
                'assigned_to' => 2,  // Sara (manager)
                'project_id'  => null,
                'created_by'  => 1,
                'created_at'  => $now, 'updated_at' => $now,
            ],
            [
                'title'       => 'Prepare Q1 payroll report',
                'description' => 'Compile payroll data for January–March 2026 and submit to finance.',
                'due_date'    => '2026-04-05',
                'priority'    => 'high',
                'status'      => 'todo',
                'assigned_to' => 2,  // Sara
                'project_id'  => null,
                'created_by'  => 1,
                'created_at'  => $now, 'updated_at' => $now,
            ],
        ]);

        // ── Task Activity Logs ────────────────────────────────────────
        // Add activity for the first task (ID 1) — "Audit legacy HR database schema"
        DB::table('task_activity_logs')->insert([
            [
                'task_id'    => 1,
                'user_id'    => 1,
                'action'     => 'created',
                'field'      => null,
                'old_value'  => null,
                'new_value'  => null,
                'created_at' => '2026-01-05 09:00:00',
                'updated_at' => '2026-01-05 09:00:00',
            ],
            [
                'task_id'    => 1,
                'user_id'    => 3,
                'action'     => 'updated',
                'field'      => 'status',
                'old_value'  => 'todo',
                'new_value'  => 'in_progress',
                'created_at' => '2026-01-10 08:30:00',
                'updated_at' => '2026-01-10 08:30:00',
            ],
            [
                'task_id'    => 1,
                'user_id'    => 3,
                'action'     => 'updated',
                'field'      => 'status',
                'old_value'  => 'in_progress',
                'new_value'  => 'done',
                'created_at' => '2026-01-28 17:00:00',
                'updated_at' => '2026-01-28 17:00:00',
            ],
            // Activity for task 6 (onboarding wireframes)
            [
                'task_id'    => 6,
                'user_id'    => 2,
                'action'     => 'created',
                'field'      => null,
                'old_value'  => null,
                'new_value'  => null,
                'created_at' => '2026-01-20 10:00:00',
                'updated_at' => '2026-01-20 10:00:00',
            ],
            [
                'task_id'    => 6,
                'user_id'    => 4,
                'action'     => 'updated',
                'field'      => 'status',
                'old_value'  => 'todo',
                'new_value'  => 'done',
                'created_at' => '2026-02-09 16:00:00',
                'updated_at' => '2026-02-09 16:00:00',
            ],
        ]);
    }
}
