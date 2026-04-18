<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Alter performance_types
        Schema::table('performance_types', function (Blueprint $table) {
            $table->unsignedTinyInteger('weight')->default(1)->after('name');
            $table->text('description')->nullable()->after('weight');
        });

        // Add review periods table
        Schema::create('performance_review_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // e.g., "Q1 2026", "Annual 2026"
            $table->enum('type', ['quarterly', 'annual', ' probation', 'project'])->default('quarterly');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['upcoming', 'active', 'closed'])->default('upcoming');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Add goals table
        Schema::create('performance_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('review_cycle_id')->nullable()->constrained('performance_review_cycles')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('category', ['kpi', 'development', 'project', 'behavioral'])->default('kpi');
            $table->enum('status', ['pending', 'in_progress', 'achieved', 'exceeded', 'not_achieved'])->default('pending');
            $table->decimal('target_value', 10, 2)->nullable();
            $table->decimal('current_value', 10, 2)->nullable();
            $table->string('unit')->nullable();
            $table->date('due_date')->nullable();
            $table->unsignedTinyInteger('weight')->default(1);  // Weight for scoring
            $table->timestamps();
        });

        // Add peer reviews table (360-degree feedback)
        Schema::create('peer_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();  // Who gives feedback
            $table->foreignId('reviewed_id')->constrained('users')->cascadeOnDelete();    // Who receives feedback
            $table->foreignId('review_cycle_id')->nullable()->constrained('performance_review_cycles')->nullOnDelete();
            $table->foreignId('type_id')->constrained('performance_types')->cascadeOnDelete();
            $table->unsignedTinyInteger('rate');  // 1-5 or 1-10
            $table->text('comment')->nullable();
            $table->enum('relationship', ['colleague', 'direct_report', 'cross_functional', 'client'])->default('colleague');
            $table->timestamps();
            
            $table->unique(['reviewer_id', 'reviewed_id', 'type_id', 'review_cycle_id'], 'unique_peer_review');
        });

        // Add self assessments table
        Schema::create('self_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('review_cycle_id')->nullable()->constrained('performance_review_cycles')->nullOnDelete();
            $table->foreignId('type_id')->constrained('performance_types')->cascadeOnDelete();
            $table->unsignedTinyInteger('rate');
            $table->text('comment')->nullable();
            $table->text('accomplishments')->nullable();
            $table->text('challenges')->nullable();
            $table->text('development_needs')->nullable();
            $table->timestamps();
        });

        // Add performance summary (aggregated scores)
        Schema::create('performance_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('review_cycle_id')->constrained('performance_review_cycles')->cascadeOnDelete();
            $table->decimal('self_score', 5, 2)->nullable();
            $table->decimal('manager_score', 5, 2)->nullable();
            $table->decimal('peer_score', 5, 2)->nullable();
            $table->decimal('team_score', 5, 2)->nullable();
            $table->decimal('final_score', 5, 2)->nullable();
            $table->enum('overall_rating', ['needs_improvement', 'meets_expectations', 'exceeds_expectations', 'exceptional'])->nullable();
            $table->text('manager_feedback')->nullable();
            $table->text('employee_comments')->nullable();
            $table->enum('status', ['draft', 'self_review', 'manager_review', 'meeting_pending', 'completed'])->default('draft');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'review_cycle_id'], 'unique_performance_summary');
        });

        // Add indexes for new tables
        Schema::table('employees_performance', function (Blueprint $table) {
            $table->foreignId('review_cycle_id')->nullable()->constrained('performance_review_cycles')->nullOnDelete();
            $table->unsignedTinyInteger('weight')->default(1);
        });

        Schema::table('teams_performance', function (Blueprint $table) {
            $table->foreignId('review_cycle_id')->nullable()->constrained('performance_review_cycles')->nullOnDelete();
        });

        // Add indexes
        Schema::table('performance_goals', function (Blueprint $table) {
            $table->index(['user_id', 'review_cycle_id']);
            $table->index(['status', 'due_date']);
        });

        Schema::table('peer_reviews', function (Blueprint $table) {
            $table->index(['reviewed_id', 'review_cycle_id']);
            $table->index(['reviewer_id', 'review_cycle_id']);
        });

        Schema::table('self_assessments', function (Blueprint $table) {
            $table->index(['user_id', 'review_cycle_id']);
        });

        Schema::table('employees_performance', function (Blueprint $table) {
            $table->index(['user_id', 'review_cycle_id']);
            $table->index(['manager_id', 'review_cycle_id']);
        });

        Schema::table('teams_performance', function (Blueprint $table) {
            $table->index(['user_id', 'review_cycle_id']);
        });
    }

    public function down(): void
    {
        Schema::table('performance_types', function (Blueprint $table) {
            $table->dropColumn(['weight', 'description']);
        });

        Schema::table('employees_performance', function (Blueprint $table) {
            $table->dropForeign(['review_cycle_id']);
            $table->dropColumn(['review_cycle_id', 'weight']);
        });

        Schema::table('teams_performance', function (Blueprint $table) {
            $table->dropForeign(['review_cycle_id']);
            $table->dropColumn('review_cycle_id');
        });

        Schema::dropIfExists('performance_summaries');
        Schema::dropIfExists('self_assessments');
        Schema::dropIfExists('peer_reviews');
        Schema::dropIfExists('performance_goals');
        Schema::dropIfExists('performance_review_cycles');
    }
};
