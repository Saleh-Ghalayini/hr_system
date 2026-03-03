<?php

namespace App\Http\Controllers;

use App\Services\AttendanceService;
use App\Traits\ApiResponse;
use App\Http\Requests\Attendance\CheckInRequest;
use App\Http\Requests\Attendance\CheckOutRequest;
use App\Http\Requests\Attendance\DateRangeRequest;
use App\Http\Requests\Attendance\TeamAttendanceRequest;
use Illuminate\Support\Facades\Auth;

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

        $attendance = $this->attendanceService->processCheckIn($user, $request->validated());

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

    public function getUserByName(TeamAttendanceRequest $request)
    {
        $data = $request->validated();
        $user = $this->attendanceService->findUserByName($data['first_name'], $data['last_name']);

        if (!$user) {
            return $this->notFound('User not found.');
        }

        return $this->success($user);
    }
}
