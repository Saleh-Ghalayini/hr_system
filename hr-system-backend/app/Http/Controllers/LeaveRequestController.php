<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use App\Models\LeaveBalance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LeaveRequestController extends Controller
{
    use ApiResponse;

    public function leaveRequest(Request $request)
    {
        $data = $request->validate([
            'leave_type' => 'required|in:annual,sick,casual,other',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'reason'     => 'required|string|max:1000',
        ]);

        $days = (int) Carbon::parse($data['start_date'])->diffInDays(Carbon::parse($data['end_date'])) + 1;

        $leaveBalance = LeaveBalance::where('user_id', Auth::id())->first();

        if (!$leaveBalance) {
            return $this->error('Leave balance record not found.', 404);
        }

        $balances    = $leaveBalance->balances;
        $currentDays = $balances[$data['leave_type']] ?? 0;

        if ($currentDays < $days) {
            return $this->error(
                "Insufficient leave balance. You have {$currentDays} day(s) remaining for {$data['leave_type']} leave.",
                400
            );
        }

        $leaveRequest = DB::transaction(function () use ($data) {
            return LeaveRequest::create([
                'user_id'    => Auth::id(),
                'leave_type' => $data['leave_type'],
                'start_date' => $data['start_date'],
                'end_date'   => $data['end_date'],
                'status'     => 'pending',
                'reason'     => $data['reason'],
            ]);
        });

        return $this->created($leaveRequest, 'Leave request submitted successfully.');
    }

    public function getLeaveRequests()
    {
        $leaveRequests = LeaveRequest::with('user:id,first_name,last_name,email')
            ->orderByDesc('created_at')
            ->get();

        return $this->success($leaveRequests);
    }

    public function getLeaveRequestsByUser()
    {
        $leaveRequests = LeaveRequest::where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->get();

        return $this->success($leaveRequests);
    }

    public function updateLeaveRequest(Request $request, LeaveRequest $leaveRequest)
    {
        $data = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        if ($leaveRequest->status !== 'pending') {
            return $this->error('This leave request has already been processed.', 400);
        }

        DB::transaction(function () use ($leaveRequest, $data) {
            $leaveRequest->update(['status' => $data['status']]);

            if ($data['status'] === 'approved') {
                $leaveBalance = LeaveBalance::where('user_id', $leaveRequest->user_id)->first();

                if (!$leaveBalance) {
                    abort(404, 'Leave balance record not found for this user.');
                }

                $balances = $leaveBalance->balances;
                $type     = $leaveRequest->leave_type;
                $days     = (int) Carbon::parse($leaveRequest->start_date)
                    ->diffInDays(Carbon::parse($leaveRequest->end_date)) + 1;

                if (($balances[$type] ?? 0) < $days) {
                    abort(400, 'Insufficient leave balance to approve this request.');
                }

                $balances[$type] -= $days;
                $leaveBalance->update(['balances' => $balances]);
            }
        });

        return $this->success($leaveRequest->fresh(), 'Leave request updated successfully.');
    }
}
