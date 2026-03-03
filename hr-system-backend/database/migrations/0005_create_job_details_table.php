<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('employment_type');
            $table->string('employment_status');
            $table->string('employee_level');
            $table->string('work_location');
            $table->date('hiring_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_details');
    }
};
