<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Support\Facades\DB;

class LeaveService
{
    private ?array $policyCache = null;

    /**
     * Fallback policy when leave_types table is unavailable (early boot/tests).
     */
    private const FALLBACK_TRACKED_BALANCES = [
        'annual' => 15,
        'sick' => 15,
        'casual' => 10,
        'pto' => 10,
        'other' => 5,
    ];

    public function calculateDays(string $startDate, string $endDate): int
    {
        return (int) Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
    }

    /** Leave types that do NOT deduct from balance (fallback). */
    private const FALLBACK_BALANCE_EXEMPT = ['unpaid', 'maternity', 'paternity', 'bereavement'];

    private function getPolicy(): array
    {
        if ($this->policyCache !== null) {
            return $this->policyCache;
        }

        try {
            $types = LeaveType::query()->get(['name', 'max_days', 'is_balance_exempt']);

            if ($types->isEmpty()) {
                return $this->policyCache = [self::FALLBACK_TRACKED_BALANCES, self::FALLBACK_BALANCE_EXEMPT];
            }

            $tracked = [];
            $exempt = [];

            foreach ($types as $type) {
                if ($type->is_balance_exempt) {
                    $exempt[] = $type->name;
                    continue;
                }

                $tracked[$type->name] = max(0, (int) $type->max_days);
            }

            return $this->policyCache = [
                $tracked ?: self::FALLBACK_TRACKED_BALANCES,
                $exempt ?: self::FALLBACK_BALANCE_EXEMPT,
            ];
        } catch (\Throwable $e) {
            return $this->policyCache = [self::FALLBACK_TRACKED_BALANCES, self::FALLBACK_BALANCE_EXEMPT];
        }
    }

    private function normalizeBalances(array $balances): array
    {
        [$trackedDefaults] = $this->getPolicy();

        return array_merge($trackedDefaults, $balances);
    }

    public function isBalanceExemptType(string $leaveType): bool
    {
        [, $exemptTypes] = $this->getPolicy();

        return in_array($leaveType, $exemptTypes, true);
    }

    public function validateBalance(LeaveBalance $leaveBalance, string $leaveType, float $days): ?string
    {
        if ($this->isBalanceExemptType($leaveType)) {
            return null; // No balance check for exempt types
        }

        $balances = $this->normalizeBalances($leaveBalance->balances ?? []);
        $available = $balances[$leaveType] ?? 0;

        if ($available < $days) {
            return "Insufficient balance. You have {$available} day(s) remaining for {$leaveType} leave.";
        }

        return null;
    }

    public function createRequest(int $userId, array $data): LeaveRequest
    {
        return DB::transaction(function () use ($userId, $data) {
            return LeaveRequest::create([
                'user_id'         => $userId,
                'leave_type'      => $data['leave_type'],
                'start_date'      => $data['start_date'],
                'end_date'        => $data['end_date'],
                'status'          => 'pending',
                'reason'          => $data['reason'],
                'is_half_day'     => $data['is_half_day'] ?? false,
                'half_day_period' => $data['half_day_period'] ?? null,
            ]);
        });
    }

    public function processApproval(LeaveRequest $leaveRequest, string $status): LeaveRequest
    {
        return DB::transaction(function () use ($leaveRequest, $status) {
            $leaveRequest->update(['status' => $status]);

            if ($status === 'approved' && !$this->isBalanceExemptType($leaveRequest->leave_type)) {
                $leaveBalance = LeaveBalance::where('user_id', $leaveRequest->user_id)->firstOrFail();

                $days     = $leaveRequest->is_half_day
                    ? 0.5
                    : $this->calculateDays($leaveRequest->start_date, $leaveRequest->end_date);
                $balances = $this->normalizeBalances($leaveBalance->balances ?? []);
                $type     = $leaveRequest->leave_type;

                if (($balances[$type] ?? 0) < $days) {
                    abort(400, 'Insufficient leave balance to approve this request.');
                }

                $balances[$type] -= $days;
                $leaveBalance->update(['balances' => $balances]);
            }

            return $leaveRequest->fresh();
        });
    }
}
