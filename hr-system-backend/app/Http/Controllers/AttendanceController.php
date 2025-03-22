<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
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
        ) {
            return "Invalid location";
        }

        $allowed_distance = 100; // in meters
        $earth_radius = 6371000;

        $user_lat = deg2rad($latitude);
        $user_long = deg2rad($longitude);
        $company_lon = deg2rad(env('COMPANY_LON'));
        $company_lat = deg2rad(env('COMPANY_LAT'));

        $lat_delta = $company_lat - $user_lat;
        $lon_delta = $company_lon - $user_long;

        $angle = 2 * asin(sqrt(pow(sin($lat_delta / 2), 2) +
            cos($user_lat) * cos($company_lat) * pow(sin($lon_delta / 2), 2)));

        $distance = $angle * $earth_radius;

        return $distance > $allowed_distance ? "Review needed" : "Approved";
    }

    public function checkIn(Request $request)
    {

        $user = Auth::user();
        $attendance = new Attendance();

        $attendance->user_id = $user->id;
        $attendance->date = date('Y-m-d');
        $attendance->check_in = now()->toTimeString();
        $attendance->check_in_lon = $request->check_in_lon;
        $attendance->check_in_lat = $request->check_in_lat;

        $attendance->location_status = $this->validateLocation($request->check_in_lon, $request->check_in_lat);
    }
}
