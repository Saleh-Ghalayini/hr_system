<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Attendance: full_name search + status filter
        Schema::table('attendances', function (Blueprint $table) {
            $table->index('full_name',      'attendances_full_name_index');
            $table->index('time_in_status', 'attendances_time_in_status_index');
        });

        // Users: name-based lookups (getUserByName, getUserAttendance)
        Schema::table('users', function (Blueprint $table) {
            $table->index(['first_name', 'last_name'], 'users_first_last_name_index');
        });

        // Performance: year filtering on created_at
        Schema::table('employees_performance', function (Blueprint $table) {
            $table->index('created_at', 'employees_performance_created_at_index');
        });

        // Payrolls: full-name search + standalone month filter
        Schema::table('payrolls', function (Blueprint $table) {
            $table->index('fullname', 'payrolls_fullname_index');
            $table->index('month',    'payrolls_month_index');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('attendances_full_name_index');
            $table->dropIndex('attendances_time_in_status_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_first_last_name_index');
        });

        Schema::table('employees_performance', function (Blueprint $table) {
            $table->dropIndex('employees_performance_created_at_index');
        });

        Schema::table('payrolls', function (Blueprint $table) {
            $table->dropIndex('payrolls_fullname_index');
            $table->dropIndex('payrolls_month_index');
        });
    }
};
