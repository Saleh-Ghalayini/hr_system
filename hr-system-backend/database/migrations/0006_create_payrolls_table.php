<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('fullname');
            $table->string('position');
            $table->foreignId('base_salary_id')->nullable()->constrained('base_salaries')->nullOnDelete();
            $table->foreignId('insurance_id')->nullable()->constrained('insurances')->nullOnDelete();
            $table->foreignId('tax_id')->nullable()->constrained('taxes')->nullOnDelete();
            $table->unsignedInteger('extra_leaves')->default(0);
            $table->string('month');
            $table->double('total')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
