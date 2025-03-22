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

        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->date('due_date');
            $table->enum('priority', ['low', 'medium', 'high']);
            $table->enum('status', ['todo', 'in_progress', 'blocked', 'done']);
            $table->unsignedBigInteger('assigned_to'); // No foreign key
            $table->unsignedBigInteger('project_id'); // No foreign key
            $table->unsignedBigInteger('created_by'); // No foreign key
            $table->timestamps();
            $table->index(['assigned_to', 'project_id']); // Indexes for queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
