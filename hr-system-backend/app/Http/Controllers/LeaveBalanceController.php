<?php

namespace App\Http\Controllers;

use App\Models\LeaveBalance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeaveBalanceController extends Controller
{
    public function getLeaveBalances()
    {
        $leaveBalances = LeaveBalance::all();
        return response()->json([
            'success' => true,
            'data' => $leaveBalances
        ], 200);
    }
    public function getLeaveBalanceForUser()
    {
        $user = Auth::user();
        $leaveBalance = LeaveBalance::where('user_id', $user->id)->first();
        return response()->json([
            'success' => true,
            'data' => $leaveBalance
        ], 200);
    }
    public function getLeaveBalanceForUserById($id)
    {
        $leaveBalance = LeaveBalance::where('user_id', $id)->first();
        return response()->json([
            'success' => true,
            'data' => $leaveBalance
        ], 200);
    }
}