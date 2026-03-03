<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin — created first so manager_id for others can reference it
        $admin = User::create([
            'first_name'    => 'Admin',
            'last_name'     => 'User',
            'email'         => 'admin@hr.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '1985-01-15',
            'nationality'   => 'Lebanese',
            'phone_number'  => '70000001',
            'address'       => 'Beirut',
            'position'      => 'Executive',
            'gender'        => 'male',
            'insurance_id'  => 3,
            'role'          => 'admin',
        ]);

        // Manager
        $manager = User::create([
            'first_name'    => 'Sara',
            'last_name'     => 'Manager',
            'email'         => 'manager@hr.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '1990-06-20',
            'nationality'   => 'Lebanese',
            'phone_number'  => '70000002',
            'address'       => 'Tripoli',
            'position'      => 'Senior',
            'gender'        => 'female',
            'insurance_id'  => 2,
            'role'          => 'manager',
            'manager_id'    => $admin->id,
        ]);

        // Regular user
        User::create([
            'first_name'    => 'Hassan',
            'last_name'     => 'Mwassi',
            'email'         => 'hassan@email.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '1995-03-10',
            'nationality'   => 'Lebanese',
            'phone_number'  => '76123123',
            'address'       => 'Tyre',
            'position'      => 'Junior',
            'gender'        => 'male',
            'insurance_id'  => 2,
            'role'          => 'user',
            'manager_id'    => $manager->id,
        ]);
    }
}
