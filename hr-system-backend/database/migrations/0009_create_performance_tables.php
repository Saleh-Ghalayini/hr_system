<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('teams_performance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('type_id')->constrained('performance_types')->cascadeOnDelete();
            $table->unsignedTinyInteger('rate');
            $table->text('comment')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('employees_performance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('manager_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('type_id')->constrained('performance_types')->cascadeOnDelete();
            $table->unsignedTinyInteger('rate');
            $table->text('comment')->nullable();
            $table->date('created_date')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees_performance');
        Schema::dropIfExists('teams_performance');
        Schema::dropIfExists('performance_types');
    }
};
