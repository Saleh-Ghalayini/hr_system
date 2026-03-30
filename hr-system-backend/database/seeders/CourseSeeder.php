<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('courses')->count() > 0) { return; }

        $now = now();

        DB::table('courses')->insert([
            [
                'course_name'      => 'React Fundamentals',
                'description'      => 'A comprehensive introduction to React — components, hooks, state management, and the React ecosystem.',
                'skills'           => json_encode(['React', 'JSX', 'Hooks', 'State Management', 'Component Design']),
                'duration_hours'   => 40,
                'certificate_text' => 'Certificate of Completion — React Fundamentals',
                'created_at'       => $now, 'updated_at' => $now,
            ],
            [
                'course_name'      => 'Laravel Backend Development',
                'description'      => 'Deep dive into Laravel 12 — routing, Eloquent ORM, API development, authentication, and testing.',
                'skills'           => json_encode(['Laravel', 'PHP', 'Eloquent', 'REST APIs', 'PHPUnit']),
                'duration_hours'   => 60,
                'certificate_text' => 'Certificate of Completion — Laravel Backend Development',
                'created_at'       => $now, 'updated_at' => $now,
            ],
            [
                'course_name'      => 'Project Management Essentials',
                'description'      => 'Core project management concepts including agile, scrum, risk management, and stakeholder communication.',
                'skills'           => json_encode(['Agile', 'Scrum', 'Risk Management', 'Communication']),
                'duration_hours'   => 24,
                'certificate_text' => 'Certificate of Completion — Project Management Essentials',
                'created_at'       => $now, 'updated_at' => $now,
            ],
            [
                'course_name'      => 'HR Compliance & Labor Law',
                'description'      => 'Understanding labor law, employee rights, compliance obligations, and HR best practices.',
                'skills'           => json_encode(['Labor Law', 'Compliance', 'HR Policies', 'Employee Relations']),
                'duration_hours'   => 16,
                'certificate_text' => 'Certificate of Completion — HR Compliance & Labor Law',
                'created_at'       => $now, 'updated_at' => $now,
            ],
            [
                'course_name'      => 'Data Analysis with Excel & Power BI',
                'description'      => 'Hands-on data analysis, pivot tables, dashboards, and business reporting using Excel and Power BI.',
                'skills'           => json_encode(['Excel', 'Power BI', 'Data Analysis', 'Dashboards', 'Reporting']),
                'duration_hours'   => 20,
                'certificate_text' => 'Certificate of Completion — Data Analysis with Excel & Power BI',
                'created_at'       => $now, 'updated_at' => $now,
            ],
            [
                'course_name'      => 'Leadership & Team Development',
                'description'      => 'Building leadership skills, motivating teams, conflict resolution, and strategic thinking.',
                'skills'           => json_encode(['Leadership', 'Team Management', 'Conflict Resolution', 'Strategy']),
                'duration_hours'   => 32,
                'certificate_text' => 'Certificate of Completion — Leadership & Team Development',
                'created_at'       => $now, 'updated_at' => $now,
            ],
        ]);
    }
}
