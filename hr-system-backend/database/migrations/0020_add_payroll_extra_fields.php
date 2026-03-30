<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payrolls', function (Blueprint $table) {
            $table->decimal('overtime_hours', 8, 2)->default(0)->after('extra_leaves');
            $table->decimal('overtime_rate', 5, 2)->default(1.5)->after('overtime_hours');
            $table->decimal('bonus', 10, 2)->default(0)->after('overtime_rate');
            $table->decimal('allowances', 10, 2)->default(0)->after('bonus');
            $table->decimal('deductions', 10, 2)->default(0)->after('allowances');
            $table->text('notes')->nullable()->after('deductions');
            $table->enum('status', ['draft', 'processed', 'paid'])->default('draft')->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('payrolls', function (Blueprint $table) {
            $table->dropColumn(['overtime_hours', 'overtime_rate', 'bonus', 'allowances', 'deductions', 'notes', 'status']);
        });
    }
};
