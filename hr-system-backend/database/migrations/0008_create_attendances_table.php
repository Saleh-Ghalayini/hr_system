<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('full_name')->nullable();
            $table->date('date')->index();
            $table->time('check_in')->nullable();
            $table->decimal('check_in_lat', 10, 8)->nullable();
            $table->decimal('check_in_lon', 10, 8)->nullable();
            $table->time('check_out')->nullable();
            $table->decimal('check_out_lat', 10, 8)->nullable();
            $table->decimal('check_out_lon', 10, 8)->nullable();
            $table->enum('status', ['Present', 'Absent', 'Late', 'Early'])->default('Absent');
            $table->decimal('working_hours', 8, 2)->nullable();
            $table->enum('time_in_status', ['On-time', 'Late'])->default('On-time');
            $table->enum('time_out_status', ['On-time', 'Early'])->default('On-time');
            $table->enum('loc_in_status', ['Approved', 'Rejected', 'Review needed'])->default('Review needed');
            $table->enum('loc_out_status', ['Approved', 'Rejected', 'Review needed'])->default('Review needed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
