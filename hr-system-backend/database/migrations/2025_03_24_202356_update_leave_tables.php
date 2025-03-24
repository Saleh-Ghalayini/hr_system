<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Update leave_requests table
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn('leave_type_id'); // Remove leave_type_id since we won't use leave_types table
            $table->string('leave_type'); // Add leave_type as a string (e.g., 'sick', 'vacation')
        });

        // Update leave_balances table
        Schema::rename('leave_balance', 'leave_balances'); // Rename table to match Laravel naming conventions

        Schema::table('leave_balances', function (Blueprint $table) {
            $table->dropColumn(['leave_type_id', 'remaining_days']); // Remove unused columns
            $table->json('balances')->nullable(); // Add JSON column for leave balances
        });

        // Drop leave_types table (no longer needed)
        Schema::dropIfExists('leave_types');
    }

    public function down(): void
    {
        // Revert leave_requests table changes
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn('leave_type');
            $table->integer('leave_type_id');
        });

        // Revert leave_balances table
        Schema::rename('leave_balances', 'leave_balance');

        Schema::table('leave_balance', function (Blueprint $table) {
            $table->integer('leave_type_id');
            $table->integer('remaining_days');
            $table->dropColumn('balances');
        });

        // Recreate leave_types table
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['annual', 'sick', 'casual', 'other']);
            $table->integer('max_absence')->default(15);
            $table->timestamps();
        });
    }
};
