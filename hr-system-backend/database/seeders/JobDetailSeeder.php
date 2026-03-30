<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JobDetailSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('job_details')->count() > 0) { return; }

        $now = now();

        // user_id => [title, employment_type, employment_status, employee_level, work_location, hiring_date]
        $details = [
            1  => ['Chief Executive Officer',      'full_time', 'active',    'executive', 'on_site', '2018-01-01'],
            2  => ['Senior Product Manager',        'full_time', 'active',    'senior',    'hybrid',  '2020-03-15'],
            3  => ['Junior Software Engineer',      'full_time', 'active',    'junior',    'remote',  '2022-06-01'],
            4  => ['Senior UX Designer',            'full_time', 'active',    'senior',    'hybrid',  '2021-09-10'],
            5  => ['Junior Data Analyst',           'full_time', 'active',    'junior',    'on_site', '2023-01-20'],
            6  => ['Junior Frontend Developer',     'full_time', 'active',    'junior',    'remote',  '2023-04-05'],
            7  => ['Software Engineering Intern',   'internship','active',    'intern',    'on_site', '2025-09-01'],
            8  => ['Senior Operations Manager',     'full_time', 'active',    'senior',    'hybrid',  '2019-07-22'],
            9  => ['Junior Backend Developer',      'full_time', 'active',    'junior',    'remote',  '2023-08-14'],
            10 => ['HR Intern',                     'internship','active',    'intern',    'on_site', '2025-10-01'],
        ];

        $rows = [];
        foreach ($details as $userId => [$title, $type, $status, $level, $location, $hireDate]) {
            $rows[] = [
                'user_id'           => $userId,
                'title'             => $title,
                'employment_type'   => $type,
                'employment_status' => $status,
                'employee_level'    => $level,
                'work_location'     => $location,
                'hiring_date'       => $hireDate,
                'created_at'        => $now,
                'updated_at'        => $now,
            ];
        }

        DB::table('job_details')->insert($rows);
    }
}
