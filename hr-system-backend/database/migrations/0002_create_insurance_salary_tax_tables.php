<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurances', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->float('cost');
            $table->float('old_cost')->default(0);
            $table->timestamps();
        });

        Schema::create('base_salaries', function (Blueprint $table) {
            $table->id();
            $table->string('position')->unique();
            $table->double('salary');
            $table->timestamps();
        });

        Schema::create('taxes', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('rate');
            $table->string('label')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('taxes');
        Schema::dropIfExists('base_salaries');
        Schema::dropIfExists('insurances');
    }
};
