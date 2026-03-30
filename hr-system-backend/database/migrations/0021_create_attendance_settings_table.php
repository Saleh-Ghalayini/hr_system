<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_settings', function (Blueprint $table) {
            $table->id();
            $table->time('work_start')->default('09:00:00');
            $table->time('work_end')->default('17:00:00');
            $table->unsignedInteger('late_threshold_minutes')->default(15);
            $table->unsignedInteger('overtime_threshold_minutes')->default(30);
            $table->unsignedInteger('max_radius_meters')->default(100);
            $table->decimal('company_lat', 10, 8)->default(0);
            $table->decimal('company_lon', 10, 8)->default(0);
            $table->boolean('require_location')->default(true);
            $table->boolean('allow_remote_checkin')->default(false);
            $table->unsignedInteger('working_days_per_week')->default(5);
            $table->json('working_days')->nullable()->comment('Array of day names: [Monday, Tuesday, ...]');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_settings');
    }
};
