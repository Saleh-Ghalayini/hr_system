<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LeaveBalanceSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('leave_balances')->count() === 0) { return; }

        $now = now();

        // Balances use leave type names as keys (annual=15 max, sick=15, casual=10, other=5)
        // Values represent remaining days
        $balances = [
            1  => ['annual' => 15, 'sick' => 15, 'casual' => 10, 'other' => 5],  // Admin — full
            2  => ['annual' => 12, 'sick' => 13, 'casual' =>  8, 'other' => 5],  // Sara
            3  => ['annual' => 10, 'sick' => 11, 'casual' =>  7, 'other' => 4],  // Hassan
            4  => ['annual' => 13, 'sick' => 15, 'casual' =>  9, 'other' => 5],  // Lara
            5  => ['annual' => 14, 'sick' => 14, 'casual' => 10, 'other' => 5],  // Omar
            6  => ['annual' =>  9, 'sick' => 12, 'casual' =>  6, 'other' => 3],  // Nour
            7  => ['annual' => 15, 'sick' => 15, 'casual' => 10, 'other' => 5],  // Karim — new intern
            8  => ['annual' => 11, 'sick' => 15, 'casual' =>  8, 'other' => 5],  // Maya
            9  => ['annual' => 13, 'sick' => 13, 'casual' =>  9, 'other' => 4],  // Ali
            10 => ['annual' => 15, 'sick' => 15, 'casual' => 10, 'other' => 5],  // Rima — new intern
        ];

        // The UserObserver already creates one leave_balance per user on registration.
        // Update those existing records with realistic remaining balances instead of inserting duplicates.
        foreach ($balances as $userId => $bal) {
            DB::table('leave_balances')
                ->where('user_id', $userId)
                ->update(['balances' => json_encode($bal), 'updated_at' => $now]);
        }
    }
}
