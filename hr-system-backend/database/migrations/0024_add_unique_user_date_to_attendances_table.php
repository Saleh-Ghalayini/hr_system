<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Keep the oldest row per user/date so the unique index can be applied safely.
        $duplicates = DB::table('attendances')
            ->select('user_id', 'date', DB::raw('MIN(id) as keep_id'), DB::raw('COUNT(*) as rows_count'))
            ->groupBy('user_id', 'date')
            ->having('rows_count', '>', 1)
            ->get();

        foreach ($duplicates as $duplicate) {
            DB::table('attendances')
                ->where('user_id', $duplicate->user_id)
                ->whereDate('date', $duplicate->date)
                ->where('id', '!=', $duplicate->keep_id)
                ->delete();
        }

        Schema::table('attendances', function (Blueprint $table) {
            $table->unique(['user_id', 'date'], 'attendances_user_date_unique');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropUnique('attendances_user_date_unique');
        });
    }
};
