<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Onboarding document requirements (admin-managed template)
        Schema::create('onboarding_documents', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon')->default('mdi:file-document');
            $table->enum('status', ['required', 'optional'])->default('required');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // User-uploaded onboarding documents
        Schema::create('user_onboarding_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_id')->constrained('onboarding_documents')->cascadeOnDelete();
            $table->string('file_path')->nullable();
            $table->string('original_name')->nullable();
            $table->enum('status', ['pending', 'uploaded', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'document_id']);
        });

        // Onboarding checklist items (admin-managed template)
        Schema::create('onboarding_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('category'); // e.g., 'Day 1', 'Week 1', 'Month 1'
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // User onboarding checklist progress
        Schema::create('user_onboarding_checklist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('checklist_item_id')->constrained('onboarding_checklist_items')->cascadeOnDelete();
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'checklist_item_id']);
        });

        // Onboarding status per user
        Schema::create('user_onboarding_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_onboarding_complete')->default(false);
            $table->timestamp('onboarding_started_at')->nullable();
            $table->timestamp('onboarding_completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_onboarding_status');
        Schema::dropIfExists('user_onboarding_checklist');
        Schema::dropIfExists('onboarding_checklist_items');
        Schema::dropIfExists('user_onboarding_documents');
        Schema::dropIfExists('onboarding_documents');
    }
};
