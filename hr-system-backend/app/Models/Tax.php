<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Payroll;

class Tax extends Model{
    
    public function payroll(){
        return $this->hasMany(Payroll::class);
    }
}
