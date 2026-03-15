<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PayrollController extends Controller
{
    use ApiResponse;

    public function getPayrolls(Request $request)
    {
        $query = Payroll::with([
            'user:id,first_name,last_name,email,position',
            'insurance:id,type,cost',
            'baseSalary:id,position,salary',
            'tax:id,label,rate',
        ])->orderBy('fullname');

        if ($search = $request->query('search')) {
            $query->where('fullname', 'like', "%$search%");
        }

        if ($month = $request->query('month')) {
            $query->where('month', $month);
        }

        return $this->success($query->paginate(20));
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
