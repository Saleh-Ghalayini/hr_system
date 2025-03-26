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
            "email" => "hassan@email.com",
            "first_name" => "Hassan",
            "last_name" => "Mwassi",
            "date_of_birth" => date("Y/m/d"),
            "address" => "Tyre",
            "password" => bcrypt("SecurePass123"),
            "insurance_id" => 2,
            "phone_number" => "76123123",
            "nationality" => "Lebanese",
            "position" => "Junior",
            "role" => "user"
        ]
    );
    }
}
