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
        Schema::create('regulation_requirements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('regulation_id');
            $table->text('requirement');
            $table->date('deadline');
            $table->enum('status', ['compliant', 'non_compliant', 'in_review']);
            $table->unsignedBigInteger('responsible_party');
            $table->timestamps();
            $table->index('regulation_id'); // Index for queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('regulation_requirements');
    }
};
