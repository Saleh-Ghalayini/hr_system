<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Payroll;

class BaseSalary extends Model{
    

    protected $fillable = [
        'role',
        'salary',
    ];

    public function payroll(){
        return $this->hasMany(Payroll::class);
    }
}
