<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use Illuminate\Http\Request;

class PayrollController extends Controller{
    
    public function getPayrolls(){
        return Payroll::all();
    }
}
