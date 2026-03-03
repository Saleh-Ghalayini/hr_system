<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Traits\ApiResponse;

class PayrollController extends Controller
{
    use ApiResponse;

    public function getPayrolls()
    {
        $payrolls = Payroll::with([
            'user:id,first_name,last_name,email,position',
            'insurance:id,type,cost',
            'baseSalary:id,position,salary',
            'tax:id,label,rate',
        ])->orderBy('fullname')->get();

        return $this->success($payrolls);
    }
}
