<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void{
        DB::table("users")->insert(
        [
            "email" => "hasan@email.com",
            "first_name" => "Hasan",
            "last_name" => "Mawassi",
            "date_of_birth" => date("Y/m/d"),
            "address" => "South",
            "password" => bcrypt("SecurePass123"),
            "insurance_id" => 3,
            "phone_number" => "1515",
            "nationality" => "Lebanese",
            "position" => "Senior",
            "role" => "admin"
        ],
        [
            "email" => "mahdi@email.com",
            "first_name" => "Mahdi",
            "last_name" => "Talal",
            "date_of_birth" => date("Y/m/d"),
            "address" => "South",
            "password" => bcrypt("SecurePass123"),
            "insurance_id" => 2,
            "phone_number" => "1616",
            "nationality" => "Lebanese",
            "position" => "Executive",
            "role" => "admin"
        ]
    );
    }
}
