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
        Schema::table('attendances', function (Blueprint $table) {

            $table->dropColumn('location_status');

            $table->enum('time_in_status', ['On-time', 'Late'])->default('On-time');
            $table->enum('time_out_status', ['On-time', 'Early'])->default('On-time');
            $table->enum('loc_in_status', ['Approved', 'Rejected', 'Review needed'])->default('Review needed');
            $table->enum('loc_out_status', ['Approved', 'Rejected', 'Review needed'])->default('Review needed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['check_in_status', 'check_out_status']);

            $table->enum('location_status', ['Approved', 'Rejected', 'Review needed'])->default('Review needed');
        });
    }
};
