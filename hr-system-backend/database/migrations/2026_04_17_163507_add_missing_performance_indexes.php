<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Note: Most indexes already exist from previous migrations.
        // These are additional indexes for filtering patterns.

        // Projects: often filtered by status (active, completed, etc.)
        Schema::table('projects', function (Blueprint $table) {
            $table->index('status', 'projects_status_index');
        });

        // Job openings: filtered by status
        Schema::table('job_openings', function (Blueprint $table) {
            $table->index('status', 'job_openings_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex('projects_status_index');
        });

        Schema::table('job_openings', function (Blueprint $table) {
            $table->dropIndex('job_openings_status_index');
        });
    }
};
