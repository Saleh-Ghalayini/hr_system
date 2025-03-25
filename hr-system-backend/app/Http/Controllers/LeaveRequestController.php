<?php

namespace App\Http\Controllers;

use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeaveRequestController extends Controller
{
    public function leaveRequest(Request $request)
    {
        $request->validate([
            'leave_type' => 'required',
            'start_date' => 'required',
            'end_date' => 'required',
            'reason' => 'required'
        ]);
        $leaveRequest = new LeaveRequest();
        $leaveRequest->user_id = Auth::user()->id;
        $leaveRequest->leave_type = $request->leave_type;

        $leaveBalance = LeaveBalance::where('user_id', Auth::user()->id)->first();
        if ($leaveBalance->balances[$request->leave_type] == 0 || $leaveBalance->balances[$request->leave_type] == null) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient leave balance'
            ], 400);
        }

        $leaveRequest->start_date = $request->start_date;
        $leaveRequest->end_date = $request->end_date;
        $leaveRequest->status = "pending";
        $leaveRequest->reason = $request->reason;
        $leaveRequest->save();
        return response()->json([
            'success' => true,
            'message' => 'Leave request created successfully',
            'data' => $leaveRequest
        ], 200);
    }
    public function getLeaveRequests()
    {
        // dd("hello");
        $leaveRequests = LeaveRequest::all();
        return response()->json([
            'success' => true,
            'data' => $leaveRequests
        ], 200);
    }
    public function getLeaveRequestsByUser()
    {
        $leaveRequests = LeaveRequest::where('user_id', Auth::user()->id)->get();
        return response()->json([
            'success' => true,
            'data' => $leaveRequests
        ], 200);
    }

    public function updateLeaveRequest(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $leaveRequest = LeaveRequest::findOrFail($id);

        if ($leaveRequest->status !== 'pending') {
            return response()->json(['message' => 'Request already processed'], 400);
        }

        $leaveRequest->update(['status' => $request->status]);

        // If approved, decrement leave balance
        if ($request->status === 'approved') {
            $leaveBalance = LeaveBalance::where('user_id', $leaveRequest->user_id)->first();

            if ($leaveBalance) {
                $balances = $leaveBalance->balances;

                if (isset($balances[$leaveRequest->leave_type]) && $balances[$leaveRequest->leave_type] > 0) {
                    $balances[$leaveRequest->leave_type]--;

                    $leaveBalance->update(['balances' => $balances]);

                    return response()->json(['message' => 'Leave approved, balance updated']);
                } else {
                    return response()->json(['message' => 'Insufficient leave balance'], 400);
                }
            }
        }

        return response()->json(['message' => 'Leave request updated']);
    }
}
