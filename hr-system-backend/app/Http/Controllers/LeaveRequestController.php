<?php

namespace App\Http\Controllers;

use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Services\LeaveService;
use App\Traits\ApiResponse;
use App\Http\Requests\Leave\CreateLeaveRequest;
use App\Http\Requests\Leave\UpdateLeaveStatusRequest;
use Illuminate\Support\Facades\Auth;

class LeaveRequestController extends Controller
{
    use ApiResponse;

    public function __construct(private LeaveService $leaveService) {}

    public function leaveRequest(CreateLeaveRequest $request)
    {
        $data         = $request->validated();
        $leaveBalance = LeaveBalance::where('user_id', Auth::id())->first();

        if (!$leaveBalance) {
            return $this->error('Leave balance record not found.', 404);
        }

        $days  = $this->leaveService->calculateDays($data['start_date'], $data['end_date']);
        $error = $this->leaveService->validateBalance($leaveBalance, $data['leave_type'], $days);

        if ($error) {
            return $this->error($error, 400);
        }

        $leaveRequest = $this->leaveService->createRequest(Auth::id(), $data);

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

    public function updateLeaveRequest(UpdateLeaveStatusRequest $request, LeaveRequest $leaveRequest)
    {
        if ($leaveRequest->status !== 'pending') {
            return $this->error('This leave request has already been processed.', 400);
        }

        $updated = $this->leaveService->processApproval($leaveRequest, $request->validated()['status']);

        return $this->success($updated, 'Leave request updated successfully.');
    }
}
