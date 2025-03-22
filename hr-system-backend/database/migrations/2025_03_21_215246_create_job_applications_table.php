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
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('candidate_id');
            $table->unsignedBigInteger('job_opening_id');
            $table->enum('status', ['applied', 'interviewed', 'hired', 'rejected']);
            $table->dateTime('interview_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['candidate_id', 'job_opening_id']); // Index for queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
