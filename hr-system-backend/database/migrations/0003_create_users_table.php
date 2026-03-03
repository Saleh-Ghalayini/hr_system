<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('remember_token', 100)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('nationality');
            $table->string('phone_number');
            $table->string('address');
            $table->text('profile_url')->nullable();
            $table->string('position');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->foreignId('insurance_id')->nullable()->constrained('insurances')->nullOnDelete();
            $table->enum('role', ['admin', 'user', 'manager'])->default('user');
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
