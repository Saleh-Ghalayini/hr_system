<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->enum('type', ['info', 'warning', 'urgent'])->default('info');
            $table->boolean('is_pinned')->default(false);
            $table->string('target_role')->nullable()->comment('null = all, or: employee, manager, admin');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['published_at', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
