<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\BaseSalary;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $this->success($query->paginate(20));
    }

    public function getMyPayroll(Request $request)
    {
        $query = Payroll::with([
            'insurance:id,type,cost',
            'baseSalary:id,position,salary',
            'tax:id,label,rate',
        ])->where('user_id', Auth::id());

        if ($month = $request->query('month')) {
            $query->where('month', $month);
        } else {
            $query->orderByDesc('month');
        }

        $payroll = $query->first();

        if (!$payroll) {
            return $this->notFound('Payroll record not found.');
        }

        return $this->success($payroll);
    }

    /** GET /profile/payroll/history — employee's full payroll history */
    public function getMyPayrollHistory()
    {
        $payrolls = Payroll::with([
            'insurance:id,type,cost',
            'baseSalary:id,position,salary',
            'tax:id,label,rate',
        ])->where('user_id', Auth::id())
          ->orderByDesc('month')
          ->get();

        return $this->success($payrolls);
    }

    /** PUT /admin/payroll/{payroll} — update payroll details (bonus, overtime, etc.) */
    public function update(Request $request, Payroll $payroll)
    {
        $data = $request->validate([
            'overtime_hours' => 'sometimes|numeric|min:0|max:200',
            'overtime_rate'  => 'sometimes|numeric|min:1|max:5',
            'bonus'          => 'sometimes|numeric|min:0',
            'allowances'     => 'sometimes|numeric|min:0',
            'deductions'     => 'sometimes|numeric|min:0',
            'extra_leaves'   => 'sometimes|integer|min:0',
            'notes'          => 'nullable|string|max:1000',
            'status'         => 'sometimes|in:draft,processed,paid',
        ]);

        $payroll->update($data);

        // Recalculate total
        $total = $this->calculateTotal($payroll->fresh());
        $payroll->update(['total' => $total]);

        $payroll->load(['insurance:id,type,cost', 'baseSalary:id,position,salary', 'tax:id,label,rate']);

        return $this->success($payroll->fresh(), 'Payroll updated successfully.');
    }

    /** POST /admin/payroll/generate — generate payrolls for all users for a month */
    public function generate(Request $request)
    {
        $data = $request->validate([
            'month' => 'required|string|regex:/^\d{4}-(0[1-9]|1[0-2])$/',
        ]);

        $month = $data['month'];

        $results = DB::transaction(function () use ($month) {
            $users = \App\Models\User::with(['jobDetail', 'insurance'])
                ->whereDoesntHave('payroll', fn($q) => $q->where('month', $month))
                ->get();

            $created = [];
            foreach ($users as $user) {
                $baseSalary = BaseSalary::where('position', $user->position)->first();

                $payroll = Payroll::create([
                    'user_id'       => $user->id,
                    'fullname'      => trim($user->first_name . ' ' . $user->last_name),
                    'position'      => $user->position ?? 'Unknown',
                    'base_salary_id' => $baseSalary?->id,
                    'insurance_id'  => $user->insurance_id,
                    'month'         => $month,
                    'status'        => 'draft',
                    'total'         => $baseSalary?->salary ?? 0,
                ]);

                $created[] = $payroll->id;
            }

            return $created;
        });

        return $this->success(
            ['generated' => count($results), 'month' => $month],
            count($results) . ' payroll records generated for ' . $month . '.'
        );
    }

    /** Recalculate net payroll total */
    private function calculateTotal(Payroll $payroll): float
    {
        $base        = $payroll->baseSalary?->salary ?? 0;
        $insurance   = $payroll->insurance?->cost ?? 0;
        $taxRate     = $payroll->tax?->rate ?? 0;
        $taxAmount   = $base * ($taxRate / 100);
        $dailyRate   = $base / 22; // 22 working days/month
        $leaveDeduct = $payroll->extra_leaves * $dailyRate;
        $overtimePay = $payroll->overtime_hours * ($base / 160) * $payroll->overtime_rate;

        return round(
            $base
            - $insurance
            - $taxAmount
            - $leaveDeduct
            - $payroll->deductions
            + $payroll->bonus
            + $payroll->allowances
            + $overtimePay,
            2
        );
    }
}
