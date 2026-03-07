<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PayrollSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        /*
         * Base salaries (id => salary):
         *   1=Intern $300, 2=Junior $800, 3=Senior $1600, 4=Executive $2100
         *
         * Insurances (id => cost):
         *   1=HAF $50, 2=GNA $70, 3=RLDA $100
         *
         * Tax id=1 @ 11%
         *
         * Net = base - insurance - (base * 0.11)
         *   Admin (4, 3) :  2100 - 100 - 231  = 1769
         *   Sara  (3, 2) :  1600 -  70 - 176  = 1354
         *   Hassan(2, 2) :   800 -  70 -  88  =  642
         *   Lara  (3, 1) :  1600 -  50 - 176  = 1374
         *   Omar  (2, 1) :   800 -  50 -  88  =  662
         *   Nour  (2, 2) :   800 -  70 -  88  =  642
         *   Karim (1, 1) :   300 -  50 -  33  =  217
         *   Maya  (3, 2) :  1600 -  70 - 176  = 1354
         *   Ali   (2, 1) :   800 -  50 -  88  =  662
         *   Rima  (1, 1) :   300 -  50 -  33  =  217
         */
        $users = [
            // user_id, fullname, position, base_salary_id, insurance_id, net_total
            [1,  'Admin User',     'Executive', 4, 3, 1769],
            [2,  'Sara Manager',   'Senior',    3, 2, 1354],
            [3,  'Hassan Mwassi',  'Junior',    2, 2,  642],
            [4,  'Lara Khalil',    'Senior',    3, 1, 1374],
            [5,  'Omar Farhat',    'Junior',    2, 1,  662],
            [6,  'Nour Haddad',    'Junior',    2, 2,  642],
            [7,  'Karim Aziz',     'Intern',    1, 1,  217],
            [8,  'Maya Saab',      'Senior',    3, 2, 1354],
            [9,  'Ali Mourad',     'Junior',    2, 1,  662],
            [10, 'Rima Khoury',    'Intern',    1, 1,  217],
        ];

        $months = ['November 2025', 'December 2025', 'January 2026', 'February 2026'];

        $rows = [];
        foreach ($months as $month) {
            foreach ($users as [$userId, $fullname, $position, $baseSalaryId, $insuranceId, $total]) {
                $rows[] = [
                    'user_id'        => $userId,
                    'fullname'       => $fullname,
                    'position'       => $position,
                    'base_salary_id' => $baseSalaryId,
                    'insurance_id'   => $insuranceId,
                    'tax_id'         => 1,
                    'extra_leaves'   => 0,
                    'month'          => $month,
                    'total'          => $total,
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ];
            }
        }

        DB::table('payrolls')->insert($rows);
    }
}
