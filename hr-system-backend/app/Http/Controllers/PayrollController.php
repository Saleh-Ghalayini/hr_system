<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Auth;

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
        ])->orderBy('fullname')->paginate(200);

        return $this->success($payrolls);
    }

    public function getMyPayroll()
    {
        $payroll = Payroll::with([
            'insurance:id,type,cost',
            'baseSalary:id,position,salary',
            'tax:id,label,rate',
        ])->where('user_id', Auth::id())->first();

        if (!$payroll) {
            return $this->notFound('Payroll record not found.');
        }

        return $this->success($payroll);
    }
}
