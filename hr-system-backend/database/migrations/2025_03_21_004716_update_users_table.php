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
        Schema::table('users', function (Blueprint $table) {
            // Remove the 'name' column
            $table->dropColumn('name');

            // Add new columns
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date-of-birth');
            $table->string('nationality');
            $table->bigInteger('phone_number');
            $table->string('address');
            $table->text('profile_url')->nullable();
            $table->string('position');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->bigInteger('insurance_id');
            $table->enum('role', ['admin', 'user', 'manager']);
            $table->unsignedBigInteger('manager_id')->nullable();

            // Foreign key constraint for manager_id
            $table->foreign('manager_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('first_name');
            $table->dropColumn('last_name');
            $table->dropColumn('date-of-birth');
            $table->dropColumn('nationality');
            $table->dropColumn('phone_number');
            $table->dropColumn('address');
            $table->dropColumn('profile_url');
            $table->dropColumn('position');
            $table->dropColumn('gender');
            $table->dropColumn('insurance_id');
            $table->dropColumn('role');
        });
    }
};
