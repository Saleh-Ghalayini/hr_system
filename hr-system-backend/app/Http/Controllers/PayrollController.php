<?php

namespace App\Http\Controllers;

use App\Models\BaseSalary;
use App\Models\Payroll;
use Illuminate\Http\Request;
use App\Models\Insurance;


class PayrollController extends Controller{
    
    public function getPayrolls(){
        return Payroll::all();
    }

    public function updateTotal(){
        $payroll = Payroll::all();
        foreach($payroll as $p){
            $p->total = $p->total +Insurance::where('type', $p->insurance)->value('old_cost') - Insurance::where('type', $p->insurance)->value('cost');
            $p->save();
        }
    }
}
