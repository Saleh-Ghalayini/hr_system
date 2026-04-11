<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Lookup / reference tables (no FK deps) ─────────────────
        $this->call(InsuranceSeeder::class);
        $this->call(BaseSalarySeeder::class);
        $this->call(TaxSeeder::class);
        $this->call(PerformanceTypeSeeder::class);
        $this->call(LeaveTypeSeeder::class);

        // ── 2. Users (depend on insurances) ───────────────────────────
        $this->call(UserSeeder::class);

        // ── 3. User-dependent records ─────────────────────────────────
        $this->call(JobDetailSeeder::class);
        $this->call(PayrollSeeder::class);
        $this->call(LeaveBalanceSeeder::class);
        $this->call(LeaveRequestSeeder::class);
        $this->call(AttendanceSeeder::class);
        $this->call(PerformanceSeeder::class);

        // ── 4. Courses → Enrollments ──────────────────────────────────
        $this->call(CourseSeeder::class);
        $this->call(EnrollmentSeeder::class);

        // ── 5. Recruitment (job openings, candidates, applications) ───
        $this->call(RecruitmentSeeder::class);

        // ── 6. Projects → Tasks ───────────────────────────────────────
        $this->call(ProjectSeeder::class);
        $this->call(TaskSeeder::class);

        // ── 7. Regulations + requirements ─────────────────────────────
        $this->call(RegulationSeeder::class);

        // ── 8. New feature modules (B2) ────────────────────────────────
        $this->call(AttendanceSettingSeeder::class);
        $this->call(AnnouncementSeeder::class);
        $this->call(HolidaySeeder::class);
    }
}
