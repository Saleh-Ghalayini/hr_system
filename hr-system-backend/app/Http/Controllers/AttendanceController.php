<?php

namespace App\Http\Controllers;

use App\Services\AttendanceService;
use App\Traits\ApiResponse;
use App\Http\Requests\Attendance\CheckInRequest;
use App\Http\Requests\Attendance\CheckOutRequest;
use App\Http\Requests\Attendance\DateRangeRequest;
use App\Http\Requests\Attendance\TeamAttendanceRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use App\Models\Attendance;

class AttendanceController extends Controller
{
    use ApiResponse;

    public function __construct(private AttendanceService $attendanceService) {}

    public function checkIn(CheckInRequest $request)
    {
        /** @var \App\Models\User $user */
        $user  = Auth::user();
        $error = $this->attendanceService->checkAttendanceState($user, 'in');

        if ($error) {
            return $this->error($error, 400);
        }

        try {
            $attendance = $this->attendanceService->processCheckIn($user, $request->validated());
        } catch (QueryException $e) {
            if ($this->isUniqueConstraintViolation($e)) {
                return $this->error('You have already checked in today.', 400);
            }

            throw $e;
        }

        return $this->success($attendance, 'Check-in successful.');
    }

    public function checkOut(CheckOutRequest $request)
    {
        /** @var \App\Models\User $user */
        $user  = Auth::user();
        $error = $this->attendanceService->checkAttendanceState($user, 'out');

        if ($error) {
            return $this->error($error, 400);
        }

        $attendance = $this->attendanceService->processCheckOut($user, $request->validated());

        return $this->success($attendance, 'Check-out successful.');
    }

    public function getMyAttendance(DateRangeRequest $request)
    {
        /** @var \App\Models\User $user */
        $user    = Auth::user();
        $records = $this->attendanceService->getMyAttendance($user, $request->validated());

        return $this->success($records);
    }

    public function getUserAttendance(TeamAttendanceRequest $request)
    {
        $result = $this->attendanceService->getUserAttendance($request->validated());

        if ($result === null) {
            return $this->notFound('User not found.');
        }

        return $this->success($result);
    }

    public function getAllUsersAttendance(DateRangeRequest $request)
    {
        $records = $this->attendanceService->getAllUsersAttendance($request->validated());

        return $this->success($records);
    }

    public function getAttendanceByUserId(DateRangeRequest $request, int $user_id)
    {
        $result = $this->attendanceService->getAttendanceByUserId($user_id, $request->validated());

        if ($result === null) {
            return $this->notFound('User not found.');
        }

        return $this->success($result);
    }

    public function getUserByName(TeamAttendanceRequest $request)
    {
        $data = $request->validated();
        $user = $this->attendanceService->findUserByName($data['first_name'], $data['last_name']);

        if (!$user) {
            return $this->notFound('User not found.');
        }

        return $this->success($user);
    }

    public function reviewLocation(Request $request, Attendance $attendance)
    {
        $data = $request->validate([
            'loc_in_status' => 'nullable|string|in:Approved,Rejected',
            'loc_out_status' => 'nullable|string|in:Approved,Rejected',
        ]);

        if (array_key_exists('loc_in_status', $data) && $data['loc_in_status'] !== null) {
            $attendance->loc_in_status = $data['loc_in_status'];
        }
        if (array_key_exists('loc_out_status', $data) && $data['loc_out_status'] !== null) {
            $attendance->loc_out_status = $data['loc_out_status'];
        }

        $attendance->save();

        return $this->success($attendance->fresh(), 'Attendance location review updated successfully.');
    }

    private function isUniqueConstraintViolation(QueryException $e): bool
    {
        $sqlState = $e->errorInfo[0] ?? null;

        return in_array($sqlState, ['23000', '23505'], true);
    }
}
