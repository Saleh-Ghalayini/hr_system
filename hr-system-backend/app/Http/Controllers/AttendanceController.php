<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{

    public function validateLocation($longitude, $latitude)
    {

        if (
            is_null($longitude) || is_null($latitude) ||
            !is_numeric($longitude) || !is_numeric($latitude) ||
            $longitude < -180 || $longitude > 180 ||
            $latitude < -90 || $latitude > 90
        )
            return "Invalid location";

        $user_lat = deg2rad($latitude);
        $user_long = deg2rad($longitude);
        $company_lon = deg2rad(env('COMPANY_LON'));
        $company_lat = deg2rad(env('COMPANY_LAT'));

        $lat_delta = $company_lat - $user_lat;
        $lon_delta = $company_lon - $user_long;

        $angle = 2 * asin(sqrt(pow(sin($lat_delta / 2), 2) +
            cos($user_lat) * cos($company_lat) * pow(sin($lon_delta / 2), 2)));

        //6371000 is the earth's radius in meters
        $distance = $angle * 6371000;

        //100 is the allowed range of distance for distance between company and user's location
        return $distance > 100 ? "Review needed" : "Approved";
    }

    public function validateTime($time, $type)
    {
        $time = Carbon::parse($time);
        $end_time = Carbon::parse(env('COMPANY_END_TIME'));
        $start_time = Carbon::parse(env('COMPANY_START_TIME'));

        if ($type === "in")
            return $time->greaterThan($start_time) ? "Late" : "On-time";
        else if ($type === "out")
            return $time->lessThan($end_time) ? "Early" : "On-time";

        return "Invalid time";
    }

    public function validateAttendance($user, $request, $type)
    {

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', now()->toDateString())
            ->first();

        if ($type === "in") {
            if ($attendance)
                return response()->json(['success' => false, 'message' => 'Already checked in today.'], 400);

            if (!$request->has(['check_in_lon', 'check_in_lat']))
                return response()->json(['success' => false, 'message' => 'Location is required.'], 400);
        } else if ($type === "out") {
            if (!$attendance)
                return response()->json(['success' => false, 'message' => 'You need to check in first.'], 400);

            if ($attendance->check_out)
                return response()->json(['success' => false, 'message' => 'You have already checked out today.'], 400);

            if (!$request->has(['check_out_lon', 'check_out_lat']))
                return response()->json(['success' => false, 'message' => 'Location data is required.'], 400);
        }

        return null;
    }

    public function checkIn(Request $request)
    {
        $user = Auth::user();

        // Checking if the user already checked in
        $validationResponse = $this->validateAttendance($user, $request, "in");

        // Stops execution if validation fails
        if ($validationResponse)
            return $validationResponse;

        $attendance = new Attendance();

        $attendance->user_id = $user->id;
        $attendance->date = date('Y-m-d');
        $attendance->check_in = now()->toTimeString();
        $attendance->check_in_lon = $request->check_in_lon;
        $attendance->check_in_lat = $request->check_in_lat;

        $attendance->time_in_status = $this->validateTime($attendance->check_in, "in");
        $attendance->loc_in_status = $this->validateLocation($request->check_in_lon, $request->check_in_lat);

        $attendance->save();

        return response()->json([
            'success' => true,
            'message' => 'Check-in successful.',
            'attendance' => $attendance
        ]);
    }

    public function checkOut(Request $request)
    {
        $user = Auth::user();

        $validationResponse = $this->validateAttendance($user, $request, "out");

        if ($validationResponse)
            return $validationResponse;

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', now()->toDateString())
            ->first();

        $attendance->update([
            'check_out' => now()->toTimeString(),
            'check_out_lon' => $request->check_out_lon,
            'check_out_lat' => $request->check_out_lat,
            'time_out_status' => $this->validateTime(now()->toTimeString(), "out"),
            'loc_out_status' => $this->validateLocation($request->check_out_lon, $request->check_out_lat)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Check-out successful.',
            'attendance' => $attendance
        ]);
    }

    public function getMyAttendance(Request $request)
    {
        $user = Auth::user();

        // Fetching all attendance records for the logged-in user
        $attendanceQuery = Attendance::Where('user_id', $user->id);

        // Fetching records having a date range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $start_date = Carbon::createFromFormat('Y-m-d', $request->start_date);
            $end_date = Carbon::createFromFormat('Y-m-d', $request->end_date);

            if ($start_date->greaterThan($end_date)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid date range: start_date must be before or equal to end_date.'
                ], 400);
            }
            $attendanceQuery->whereBetween('date', [$start_date, $end_date]);
        } else if ($request->filled('date')) {
            $date = Carbon::createFromFormat('Y-m-d', $request->date);
            $attendanceQuery->whereDate('date', $date);
        }

        // Fetching the records after applying the conditions
        $attendance = $attendanceQuery->orderBy('date', 'desc')->get();
        return response()->json([
            'success' => true,
            'message' => 'records for user retrieved successfully.',
            'user' => $user,
            'attendance' => $attendance
        ]);
    }
}
