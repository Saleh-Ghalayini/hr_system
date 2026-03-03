<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use App\Models\LeaveBalance;
use Illuminate\Support\Facades\Auth;

class LeaveBalanceController extends Controller
{
    use ApiResponse;

    public function getLeaveBalances()
    {
        $leaveBalances = LeaveBalance::with('user:id,first_name,last_name,email')
            ->get();

        return $this->success($leaveBalances);
    }

    public function getLeaveBalanceForUser(?User $user = null)
    {
        $target = $user ?? Auth::user();

        $leaveBalance = LeaveBalance::where('user_id', $target->id)->first();

        if (!$leaveBalance) {
            return $this->notFound('Leave balance not found.');
        }

        return $this->success($leaveBalance);
    }

    public function getLeaveBalanceForUserById($id)
    {
        $leaveBalance = LeaveBalance::where('user_id', $id)->first();

        if (!$leaveBalance) {
            return $this->notFound('Leave balance not found.');
        }

        return $this->success($leaveBalance);
    }
}
