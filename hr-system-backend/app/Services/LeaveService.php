<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use Illuminate\Support\Facades\DB;

class LeaveService
{
    public function calculateDays(string $startDate, string $endDate): int
    {
        return (int) Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
    }

    /** Leave types that do NOT deduct from balance */
    private const BALANCE_EXEMPT = ['unpaid', 'maternity', 'paternity', 'bereavement'];

    public function validateBalance(LeaveBalance $leaveBalance, string $leaveType, float $days): ?string
    {
        if (in_array($leaveType, self::BALANCE_EXEMPT)) {
            return null; // No balance check for exempt types
        }

        $available = $leaveBalance->balances[$leaveType] ?? 0;

        if ($available < $days) {
            return "Insufficient balance. You have {$available} day(s) remaining for {$leaveType} leave.";
        }

        return null;
    }

    public function createRequest(int $userId, array $data, ?string $documentPath = null): LeaveRequest
    {
        return DB::transaction(function () use ($userId, $data, $documentPath) {
            return LeaveRequest::create([
                'user_id'         => $userId,
                'leave_type'      => $data['leave_type'],
                'start_date'      => $data['start_date'],
                'end_date'        => $data['end_date'],
                'status'          => 'pending',
                'reason'          => $data['reason'],
                'document_path'   => $documentPath,
                'is_half_day'     => $data['is_half_day'] ?? false,
                'half_day_period' => $data['half_day_period'] ?? null,
            ]);
        });
    }

    public function processApproval(LeaveRequest $leaveRequest, string $status): LeaveRequest
    {
        return DB::transaction(function () use ($leaveRequest, $status) {
            $leaveRequest->update(['status' => $status]);

            if ($status === 'approved' && !in_array($leaveRequest->leave_type, self::BALANCE_EXEMPT)) {
                $leaveBalance = LeaveBalance::where('user_id', $leaveRequest->user_id)->firstOrFail();

                $days     = $leaveRequest->is_half_day
                    ? 0.5
                    : $this->calculateDays($leaveRequest->start_date, $leaveRequest->end_date);
                $balances = $leaveBalance->balances;
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
