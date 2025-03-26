<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Payroll;

class Insurance extends Model{
    
    protected $fillable = [
        'type',
        'cost',
        "old_cost"
    ];

    public function payroll(){
        return $this->hasMany(Payroll::class);
    }
}
