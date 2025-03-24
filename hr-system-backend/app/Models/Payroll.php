<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\BaseSalary;
use App\Models\Insurance;

class Payroll extends Model{
    
    protected $fillable = [
        'user_id',
        'insurance_id',
        'base_salary_id',
        'extra_leaves',
        'month',
    ];

    public function insurance(){
        return $this->belongsTo(Insurance::class);
    }

    public function baseSalary(){
        return $this->belongsTo(BaseSalary::class);
    }
}
