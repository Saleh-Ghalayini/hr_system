<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('date')->index();
            $table->time('check_in')->nullable();
            $table->decimal('check_in_lon', 10, 8)->nullable();
            $table->decimal('check_in_lat', 10, 8)->nullable();
            $table->time('check_out')->nullable();
            $table->decimal('check_out_lon', 10, 8)->nullable();
            $table->decimal('check_out_lat', 10, 8)->nullable();
            $table->enum('location_status', ['Approved', 'Rejected', 'Review needed'])->default('Review needed');
            $table->enum('status', ['Present', 'Absent', 'Late', 'Early'])->default('Absent');
            $table->decimal('working_hours', 8, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
