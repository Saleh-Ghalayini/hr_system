<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->index(['user_id', 'date']);
        });

        Schema::table('payrolls', function (Blueprint $table) {
            $table->index(['user_id', 'month']);
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->index(['user_id', 'status']);
        });

        Schema::table('employees_performance', function (Blueprint $table) {
            $table->index(['user_id', 'type_id']);
        });

        Schema::table('teams_performance', function (Blueprint $table) {
            $table->index(['user_id', 'type_id']);
        });

        // Unique constraint to prevent duplicate leave balances per user
        Schema::table('leave_balances', function (Blueprint $table) {
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'date']);
        });

        Schema::table('payrolls', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'month']);
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'status']);
        });

        Schema::table('employees_performance', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'type_id']);
        });

        Schema::table('teams_performance', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'type_id']);
        });

        Schema::table('leave_balances', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
        });
    }
};
