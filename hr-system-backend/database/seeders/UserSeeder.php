<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Skip if users already exist (idempotent re-run safety)
        if (User::count() > 0) {
            $this->command->info('UserSeeder: users already exist, skipping.');
            return;
        }

        // Look up insurance IDs by type so this seeder works with any auto-increment state
        $haf  = DB::table('insurances')->where('type', 'HAF')->value('id');
        $gna  = DB::table('insurances')->where('type', 'GNA')->value('id');
        $rlda = DB::table('insurances')->where('type', 'RLDA')->value('id');

        // ─── ID 1: Admin ─────────────────────────────────────────────
        $admin = User::create([
            'first_name'    => 'Admin',
            'last_name'     => 'User',
            'email'         => 'admin@hr.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '1980-04-10',
            'nationality'   => 'Lebanese',
            'phone_number'  => '70000001',
            'address'       => 'Beirut, Hamra',
            'position'      => 'Executive',
            'gender'        => 'male',
            'insurance_id'  => $rlda,
            'role'          => 'admin',
        ]);

        // ─── ID 2: Manager (Sara) ─────────────────────────────────────
        $manager1 = User::create([
            'first_name'    => 'Sara',
            'last_name'     => 'Manager',
            'email'         => 'manager@hr.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '1990-06-20',
            'nationality'   => 'Lebanese',
            'phone_number'  => '70000002',
            'address'       => 'Tripoli, Downtown',
            'position'      => 'Senior',
            'gender'        => 'female',
            'insurance_id'  => $gna,
            'role'          => 'manager',
            'manager_id'    => $admin->id,
        ]);

        // ─── ID 3: Employee (Hassan) ──────────────────────────────────
        User::create([
            'first_name'    => 'Hassan',
            'last_name'     => 'Mwassi',
            'email'         => 'hassan@email.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '1995-03-10',
            'nationality'   => 'Lebanese',
            'phone_number'  => '76123123',
            'address'       => 'Tyre, Main St',
            'position'      => 'Junior',
            'gender'        => 'male',
            'insurance_id'  => $gna,
            'role'          => 'user',
            'manager_id'    => $manager1->id,
        ]);

        // ─── ID 4: Lara Khalil ────────────────────────────────────────
        User::create([
            'first_name'    => 'Lara',
            'last_name'     => 'Khalil',
            'email'         => 'lara@hr.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '1992-08-14',
            'nationality'   => 'Lebanese',
            'phone_number'  => '71234001',
            'address'       => 'Beirut, Achrafieh',
            'position'      => 'Senior',
            'gender'        => 'female',
            'insurance_id'  => $haf,
            'role'          => 'user',
            'manager_id'    => $manager1->id,
        ]);

        // ─── ID 5: Omar Farhat ────────────────────────────────────────
        User::create([
            'first_name'    => 'Omar',
            'last_name'     => 'Farhat',
            'email'         => 'omar@hr.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '1997-01-25',
            'nationality'   => 'Lebanese',
            'phone_number'  => '71234002',
            'address'       => 'Sidon, Riad El Solh',
            'position'      => 'Junior',
            'gender'        => 'male',
            'insurance_id'  => $haf,
            'role'          => 'user',
            'manager_id'    => $manager1->id,
        ]);

        // ─── ID 6: Nour Haddad ───────────────────────────────────────
        User::create([
            'first_name'    => 'Nour',
            'last_name'     => 'Haddad',
            'email'         => 'nour@hr.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '1998-11-03',
            'nationality'   => 'Lebanese',
            'phone_number'  => '71234003',
            'address'       => 'Jounieh, Centre',
            'position'      => 'Junior',
            'gender'        => 'female',
            'insurance_id'  => $gna,
            'role'          => 'user',
            'manager_id'    => $manager1->id,
        ]);

        // ─── ID 7: Karim Aziz ────────────────────────────────────────
        User::create([
            'first_name'    => 'Karim',
            'last_name'     => 'Aziz',
            'email'         => 'karim@hr.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '2001-05-17',
            'nationality'   => 'Lebanese',
            'phone_number'  => '71234004',
            'address'       => 'Baabda, Main Road',
            'position'      => 'Intern',
            'gender'        => 'male',
            'insurance_id'  => $haf,
            'role'          => 'user',
            'manager_id'    => $manager1->id,
        ]);

        // ─── ID 8: Maya Saab (second manager) ────────────────────────
        $manager2 = User::create([
            'first_name'    => 'Maya',
            'last_name'     => 'Saab',
            'email'         => 'maya@hr.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '1988-09-30',
            'nationality'   => 'Lebanese',
            'phone_number'  => '71234005',
            'address'       => 'Beirut, Verdun',
            'position'      => 'Senior',
            'gender'        => 'female',
            'insurance_id'  => $gna,
            'role'          => 'manager',
            'manager_id'    => $admin->id,
        ]);

        // ─── ID 9: Ali Mourad ─────────────────────────────────────────
        User::create([
            'first_name'    => 'Ali',
            'last_name'     => 'Mourad',
            'email'         => 'ali@hr.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '1996-07-08',
            'nationality'   => 'Lebanese',
            'phone_number'  => '71234006',
            'address'       => 'Nabatieh, Bazar',
            'position'      => 'Junior',
            'gender'        => 'male',
            'insurance_id'  => $haf,
            'role'          => 'user',
            'manager_id'    => $manager2->id,
        ]);

        // ─── ID 10: Rima Khoury ──────────────────────────────────────
        User::create([
            'first_name'    => 'Rima',
            'last_name'     => 'Khoury',
            'email'         => 'rima@hr.com',
            'password'      => Hash::make('SecurePass123'),
            'date_of_birth' => '2000-02-14',
            'nationality'   => 'Lebanese',
            'phone_number'  => '71234007',
            'address'       => 'Zahle, El Muallem',
            'position'      => 'Intern',
            'gender'        => 'female',
            'insurance_id'  => $haf,
            'role'          => 'user',
            'manager_id'    => $manager2->id,
        ]);
    }
}
