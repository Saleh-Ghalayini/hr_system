<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\BaseSalary;
use App\Models\Tax;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    use ApiResponse;

    /**
     * GET /admin/payroll — paginated list of all payroll records.
     */
    public function getPayrolls(Request $request)
    {
        $query = Payroll::with([
            'user:id,first_name,last_name,email,position',
            'insurance:id,type,cost',
            'baseSalary:id,position,salary',
            'tax:id,label,rate',
        ])->orderBy('month', 'desc')->orderBy('fullname');

        if ($search = $request->query('search')) {
            $query->where('fullname', 'like', "%$search%");
        }

        if ($month = $request->query('month')) {
            // Support both Y-m and "F Y" formats
            $query->where(function ($q) use ($month) {
                $q->where('month', $month);
                if (preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $month)) {
                    $legacyMonth = Carbon::createFromFormat('Y-m', $month)->format('F Y');
                    $q->orWhere('month', $legacyMonth);
                }
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $this->success($query->paginate(20));
    }

    /**
     * GET /profile/payroll — employee's current/last payroll record.
     */
    public function getMyPayroll(Request $request)
    {
        $query = Payroll::with([
            'insurance:id,type,cost',
            'baseSalary:id,position,salary',
            'tax:id,label,rate',
        ])->where('user_id', Auth::id());

        if ($month = $request->query('month')) {
            $query->where(function ($q) use ($month) {
                $q->where('month', $month);
                // Backward compatibility for legacy textual month storage (e.g. "March 2026").
                if (preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $month)) {
                    $legacyMonth = Carbon::createFromFormat('Y-m', $month)->format('F Y');
                    $q->orWhere('month', $legacyMonth);
                }
            });
        } else {
            $query->orderByDesc('month');
        }

        $payroll = $query->first();

        if (!$payroll) {
            return $this->notFound('Payroll record not found.');
        }

        return $this->success($payroll);
    }

    /**
     * GET /profile/payroll/history — employee's full payroll history.
     */
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

    /**
     * PUT /admin/payroll/{payroll} — update payroll details (bonus, overtime, etc.)
     */
    public function update(Request $request, Payroll $payroll)
    {
        // Protect already-paid records from edits
        if ($payroll->status === 'paid') {
            return $this->error('Cannot modify a paid payroll record.', 422);
        }

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

    /**
     * POST /admin/payroll/recalculate/{payroll} — force recalculate payroll total.
     */
    public function recalculate(Payroll $payroll)
    {
        // Protect already-paid records from recalculation
        if ($payroll->status === 'paid') {
            return $this->error('Cannot recalculate a paid payroll record.', 422);
        }

        $total = $this->calculateTotal($payroll);
        $payroll->update(['total' => $total]);

        $payroll->load(['insurance:id,type,cost', 'baseSalary:id,position,salary', 'tax:id,label,rate']);

        return $this->success($payroll, 'Payroll total recalculated successfully.');
    }

    /**
     * POST /admin/payroll/generate — generate payrolls for all users for a month.
     * Uses consistent Y-m format for month storage.
     */
    public function generate(Request $request)
    {
        $data = $request->validate([
            'month' => ['required', 'string'],
        ]);

        $monthInput = trim($data['month']);
        if (preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $monthInput)) {
            $month = $monthInput;
        } else {
            try {
                $month = Carbon::createFromFormat('F Y', $monthInput)->format('Y-m');
            } catch (\Throwable $e) {
                return $this->error('Invalid month format. Use YYYY-MM.', 422);
            }
        }
        $defaultTax = Tax::first();

        $results = DB::transaction(function () use ($month, $defaultTax) {
            $users = \App\Models\User::with(['jobDetail', 'insurance'])
                ->whereDoesntHave('payroll', fn($q) => $q->where('month', $month))
                ->get();

            $created = [];
            foreach ($users as $user) {
                $baseSalary = BaseSalary::where('position', $user->position)->first();

                $payroll = Payroll::create([
                    'user_id'        => $user->id,
                    'fullname'       => trim($user->first_name . ' ' . $user->last_name),
                    'position'       => $user->position ?? 'Unknown',
                    'base_salary_id' => $baseSalary?->id,
                    'insurance_id'   => $user->insurance_id,
                    'tax_id'         => $defaultTax?->id,
                    'extra_leaves'   => 0,
                    'overtime_hours' => 0,
                    'overtime_rate'  => 1.5,
                    'bonus'          => 0,
                    'allowances'     => 0,
                    'deductions'     => 0,
                    'notes'          => null,
                    'month'          => $month,
                    'status'         => 'draft',
                    'total'          => $this->calculateInitialTotal($baseSalary, $user->insurance, $defaultTax),
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

    /**
     * Calculate initial total for a newly generated payroll record.
     */
    private function calculateInitialTotal(?BaseSalary $baseSalary, $insurance, ?Tax $tax): float
    {
        $base       = $baseSalary?->salary ?? 0;
        $insCost    = $insurance?->cost ?? 0;
        $taxRate    = $tax?->rate ?? 0;
        $taxAmount  = $base * ($taxRate / 100);

        return round($base - $insCost - $taxAmount, 2);
    }

    /**
     * Recalculate net payroll total — used for updates and recalculations.
     */
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
