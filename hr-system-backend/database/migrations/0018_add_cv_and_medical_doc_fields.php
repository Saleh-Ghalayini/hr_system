<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // CV upload for candidates (onboarding recruitment)
        Schema::table('candidates', function (Blueprint $table) {
            $table->string('cv_path')->nullable()->after('resume_path');
            $table->string('linkedin_url')->nullable()->after('cv_path');
            $table->text('notes')->nullable()->after('linkedin_url');
        });

        // Medical document upload for sick leave requests
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->string('document_path')->nullable()->after('reason');
            $table->boolean('is_half_day')->default(false)->after('document_path');
            $table->enum('half_day_period', ['morning', 'afternoon'])->nullable()->after('is_half_day');
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn(['cv_path', 'linkedin_url', 'notes']);
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn(['document_path', 'is_half_day', 'half_day_period']);
        });
    }
};
