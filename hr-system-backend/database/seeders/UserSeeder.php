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
            "email" => "halim@email.com",
            "first_name" => "Halim",
            "last_name" => "Njeim",
            "date_of_birth" => date("Y/m/d"),
            "address" => "Bekaa",
            "password" => bcrypt("SecurePass123"),
            "insurance_id" => 3,
            "phone_number" => "1616",
            "nationality" => "Lebanese",
            "position" => "Intern",
            "role" => "admin"
        ]
    );
    }
}
