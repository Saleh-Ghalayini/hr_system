<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // Employees to generate attendance for (all except admin)
        $employees = [
            2 => ['full_name' => 'Sara Manager',  'lat' => 34.4431, 'lon' => 35.8497],
            3 => ['full_name' => 'Hassan Mwassi', 'lat' => 33.2704, 'lon' => 35.2037],
            4 => ['full_name' => 'Lara Khalil',   'lat' => 33.8938, 'lon' => 35.5018],
            5 => ['full_name' => 'Omar Farhat',   'lat' => 33.5619, 'lon' => 35.3714],
            6 => ['full_name' => 'Nour Haddad',   'lat' => 33.9806, 'lon' => 35.6139],
            7 => ['full_name' => 'Karim Aziz',    'lat' => 33.8131, 'lon' => 35.5383],
            8 => ['full_name' => 'Maya Saab',     'lat' => 33.8938, 'lon' => 35.4707],
            9 => ['full_name' => 'Ali Mourad',    'lat' => 33.3672, 'lon' => 35.4839],
           10 => ['full_name' => 'Rima Khoury',   'lat' => 33.8506, 'lon' => 35.9017],
        ];

        /*
         * Pattern determinant: ($userId + $dayOfMonth) % 10
         *   0,1      => Absent
         *   2        => Late check-in + Early check-out
         *   3        => Late check-in, normal check-out
         *   4..9     => Present, On-time
         */

        $rows = [];

        // Generate for December 2025 + January 2026 + February 2026
        $ranges = [
            [Carbon::create(2025, 12, 1), Carbon::create(2025, 12, 31)],
            [Carbon::create(2026,  1, 1), Carbon::create(2026,  1, 31)],
            [Carbon::create(2026,  2, 1), Carbon::create(2026,  2, 28)],
        ];

        foreach ($ranges as [$start, $end]) {
            $current = $start->copy();
            while ($current->lte($end)) {
                if ($current->isWeekend()) {
                    $current->addDay();
                    continue;
                }

                $day = $current->day;
                $dateStr = $current->toDateString();

                foreach ($employees as $userId => $emp) {
                    $pattern = ($userId + $day) % 10;

                    if ($pattern <= 1) {
                        // Absent
                        $rows[] = [
                            'user_id'         => $userId,
                            'full_name'       => $emp['full_name'],
                            'date'            => $dateStr,
                            'check_in'        => null,
                            'check_in_lat'    => null,
                            'check_in_lon'    => null,
                            'check_out'       => null,
                            'check_out_lat'   => null,
                            'check_out_lon'   => null,
                            'status'          => 'Absent',
                            'working_hours'   => null,
                            'time_in_status'  => 'On-time',
                            'time_out_status' => 'On-time',
                            'loc_in_status'   => 'Review needed',
                            'loc_out_status'  => 'Review needed',
                            'created_at'      => $now,
                            'updated_at'      => $now,
                        ];
                    } elseif ($pattern === 2) {
                        // Late check-in + Early check-out
                        $rows[] = [
                            'user_id'         => $userId,
                            'full_name'       => $emp['full_name'],
                            'date'            => $dateStr,
                            'check_in'        => '09:45:00',
                            'check_in_lat'    => $emp['lat'],
                            'check_in_lon'    => $emp['lon'],
                            'check_out'       => '15:30:00',
                            'check_out_lat'   => $emp['lat'],
                            'check_out_lon'   => $emp['lon'],
                            'status'          => 'Late',
                            'working_hours'   => 5.75,
                            'time_in_status'  => 'Late',
                            'time_out_status' => 'Early',
                            'loc_in_status'   => 'Approved',
                            'loc_out_status'  => 'Approved',
                            'created_at'      => $now,
                            'updated_at'      => $now,
                        ];
                    } elseif ($pattern === 3) {
                        // Late check-in, normal check-out
                        $rows[] = [
                            'user_id'         => $userId,
                            'full_name'       => $emp['full_name'],
                            'date'            => $dateStr,
                            'check_in'        => '09:30:00',
                            'check_in_lat'    => $emp['lat'],
                            'check_in_lon'    => $emp['lon'],
                            'check_out'       => '17:30:00',
                            'check_out_lat'   => $emp['lat'],
                            'check_out_lon'   => $emp['lon'],
                            'status'          => 'Late',
                            'working_hours'   => 8.00,
                            'time_in_status'  => 'Late',
                            'time_out_status' => 'On-time',
                            'loc_in_status'   => 'Approved',
                            'loc_out_status'  => 'Approved',
                            'created_at'      => $now,
                            'updated_at'      => $now,
                        ];
                    } else {
                        // Present, On-time
                        $checkIn  = '08:' . str_pad(($userId * 7 + $day) % 60, 2, '0', STR_PAD_LEFT) . ':00';
                        $rows[] = [
                            'user_id'         => $userId,
                            'full_name'       => $emp['full_name'],
                            'date'            => $dateStr,
                            'check_in'        => $checkIn,
                            'check_in_lat'    => $emp['lat'],
                            'check_in_lon'    => $emp['lon'],
                            'check_out'       => '17:00:00',
                            'check_out_lat'   => $emp['lat'],
                            'check_out_lon'   => $emp['lon'],
                            'status'          => 'Present',
                            'working_hours'   => 9.00 - (($userId * 7 + $day) % 60) / 60,
                            'time_in_status'  => 'On-time',
                            'time_out_status' => 'On-time',
                            'loc_in_status'   => 'Approved',
                            'loc_out_status'  => 'Approved',
                            'created_at'      => $now,
                            'updated_at'      => $now,
                        ];
                    }
                }

                $current->addDay();
            }
        }

        // Insert in chunks to avoid hitting query size limits
        foreach (array_chunk($rows, 200) as $chunk) {
            DB::table('attendances')->insert($chunk);
        }
    }
}
