<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Reference / lookup data first (no FK dependencies)
        $this->call(InsuranceSeeder::class);
        $this->call(BaseSalarySeeder::class);
        $this->call(TaxSeeder::class);
        $this->call(PerformanceTypeSeeder::class);
        $this->call(LeaveTypeSeeder::class);

        // Users depend on insurances
        $this->call(UserSeeder::class);

        // Sample data for new modules
        $this->call(ProjectSeeder::class);
        $this->call(RegulationSeeder::class);
    }
}
