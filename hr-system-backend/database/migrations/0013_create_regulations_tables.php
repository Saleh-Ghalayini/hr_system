<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regulations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('jurisdiction');
            $table->text('description');
            $table->date('effective_date');
            $table->timestamps();
        });

        Schema::create('regulation_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('regulation_id')->constrained('regulations')->cascadeOnDelete();
            $table->text('requirement');
            $table->date('deadline')->nullable();
            $table->enum('status', ['compliant', 'non_compliant', 'in_review'])->default('in_review');
            $table->foreignId('responsible_party')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('regulation_requirements');
        Schema::dropIfExists('regulations');
    }
};
