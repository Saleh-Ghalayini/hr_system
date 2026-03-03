<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Attendance;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    use ApiResponse;

    private function validateLocation(float $longitude, float $latitude): string
    {
        if ($longitude < -180 || $longitude > 180 || $latitude < -90 || $latitude > 90) {
            return 'Invalid location';
        }

        $userLat    = deg2rad($latitude);
        $userLon    = deg2rad($longitude);
        $companyLat = deg2rad((float) env('COMPANY_LAT', 0));
        $companyLon = deg2rad((float) env('COMPANY_LON', 0));

        $dlat  = $companyLat - $userLat;
        $dlon  = $companyLon - $userLon;
        $angle = 2 * asin(sqrt(
            pow(sin($dlat / 2), 2) +
                cos($userLat) * cos($companyLat) * pow(sin($dlon / 2), 2)
        ));

        $distance = $angle * 6371000;

        Log::info('Attendance location check', [
            'distance_m' => round($distance, 2),
            'user_lat'   => $latitude,
            'user_lon'   => $longitude,
        ]);

        return $distance >= 100 ? 'Review needed' : 'Approved';
    }

    private function validateTime(string $time, string $type): string
    {
        $t         = Carbon::parse($time);
        $startTime = Carbon::parse(env('COMPANY_START_TIME', '09:00:00'));
        $endTime   = Carbon::parse(env('COMPANY_END_TIME', '17:00:00'));

        if ($type === 'in') {
            return $t->greaterThan($startTime) ? 'Late' : 'On-time';
        }

        if ($type === 'out') {
            return $t->lessThan($endTime) ? 'Early' : 'On-time';
        }

        return 'Invalid time';
    }

    private function checkAttendanceState(User $user, string $type)
    {
        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', now()->toDateString())
            ->first();

        if ($type === 'in') {
            if ($attendance) {
                return $this->error('You have already checked in today.', 400);
            }
        } elseif ($type === 'out') {
            if (!$attendance) {
                return $this->error('You need to check in before checking out.', 400);
            }
            if ($attendance->check_out) {
                return $this->error('You have already checked out today.', 400);
            }
        }

        return null;
    }

    public function checkIn(Request $request)
    {
        $request->validate([
            'check_in_lon' => 'required|numeric|between:-180,180',
            'check_in_lat' => 'required|numeric|between:-90,90',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $err = $this->checkAttendanceState($user, 'in');
        if ($err) {
            return $err;
        }

        $attendance = Attendance::create([
            'user_id'        => $user->id,
            'full_name'      => trim($user->first_name . ' ' . $user->last_name),
            'date'           => now()->toDateString(),
            'check_in'       => now()->toTimeString(),
            'check_in_lon'   => $request->check_in_lon,
            'check_in_lat'   => $request->check_in_lat,
            'time_in_status' => $this->validateTime(now()->toTimeString(), 'in'),
            'loc_in_status'  => $this->validateLocation((float) $request->check_in_lon, (float) $request->check_in_lat),
        ]);

        return $this->success($attendance, 'Check-in successful.');
    }

    public function checkOut(Request $request)
    {
        $request->validate([
            'check_out_lon' => 'required|numeric|between:-180,180',
            'check_out_lat' => 'required|numeric|between:-90,90',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $err = $this->checkAttendanceState($user, 'out');
        if ($err) {
            return $err;
        }

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', now()->toDateString())
            ->first();

        $attendance->update([
            'check_out'       => now()->toTimeString(),
            'check_out_lon'   => $request->check_out_lon,
            'check_out_lat'   => $request->check_out_lat,
            'time_out_status' => $this->validateTime(now()->toTimeString(), 'out'),
            'loc_out_status'  => $this->validateLocation((float) $request->check_out_lon, (float) $request->check_out_lat),
        ]);

        return $this->success($attendance->fresh(), 'Check-out successful.');
    }

    public function getMyAttendance(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date'   => 'sometimes|date_format:Y-m-d|after_or_equal:start_date',
            'date'       => 'sometimes|date_format:Y-m-d',
        ]);

        /** @var \App\Models\User $user */
        $user  = Auth::user();
        $query = Attendance::where('user_id', $user->id);

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        return $this->success($query->orderByDesc('date')->get());
    }

    public function getUserAttendance(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date'   => 'sometimes|date_format:Y-m-d|after_or_equal:start_date',
            'date'       => 'sometimes|date_format:Y-m-d',
        ]);

        $user = User::where('first_name', $request->first_name)
            ->where('last_name', $request->last_name)
            ->first();

        if (!$user) {
            return $this->notFound('User not found.');
        }

        $query = Attendance::where('user_id', $user->id);

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        return $this->success([
            'user'       => $user->only(['id', 'first_name', 'last_name']),
            'attendance' => $query->orderByDesc('date')->get(),
        ]);
    }

    public function getAllUsersAttendance(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date'   => 'sometimes|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        $query = Attendance::query();

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        return $this->success($query->orderByDesc('date')->get());
    }

    public function getUserByName(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
        ]);

        $user = User::where('first_name', $request->first_name)
            ->where('last_name', $request->last_name)
            ->first();

        if (!$user) {
            return $this->notFound('User not found.');
        }

        return $this->success($user);
    }
}
