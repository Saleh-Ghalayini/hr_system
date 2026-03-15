<?php

namespace App\Services;

use App\Models\User;
use App\Models\Attendance;
use Illuminate\Support\Facades\Log;

class AttendanceService
{
    public function validateLocation(float $longitude, float $latitude): string
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

    public function validateTime(string $time, string $type): string
    {
        $t         = \Carbon\Carbon::parse($time);
        $startTime = \Carbon\Carbon::parse(env('COMPANY_START_TIME', '09:00:00'));
        $endTime   = \Carbon\Carbon::parse(env('COMPANY_END_TIME', '17:00:00'));

        if ($type === 'in') {
            return $t->greaterThan($startTime) ? 'Late' : 'On-time';
        }

        if ($type === 'out') {
            return $t->lessThan($endTime) ? 'Early' : 'On-time';
        }

        return 'Invalid time';
    }

    public function checkAttendanceState(User $user, string $type): ?string
    {
        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', now()->toDateString())
            ->first();

        if ($type === 'in') {
            if ($attendance) {
                return 'You have already checked in today.';
            }
        } elseif ($type === 'out') {
            if (!$attendance) {
                return 'You need to check in before checking out.';
            }
            if ($attendance->check_out) {
                return 'You have already checked out today.';
            }
        }

        return null;
    }

    public function processCheckIn(User $user, array $data): Attendance
    {
        return Attendance::create([
            'user_id'        => $user->id,
            'full_name'      => trim($user->first_name . ' ' . $user->last_name),
            'date'           => now()->toDateString(),
            'check_in'       => now()->toTimeString(),
            'check_in_lon'   => $data['check_in_lon'],
            'check_in_lat'   => $data['check_in_lat'],
            'time_in_status' => $this->validateTime(now()->toTimeString(), 'in'),
            'loc_in_status'  => $this->validateLocation((float) $data['check_in_lon'], (float) $data['check_in_lat']),
        ]);
    }

    public function processCheckOut(User $user, array $data): Attendance
    {
        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', now()->toDateString())
            ->firstOrFail();

        $attendance->update([
            'check_out'       => now()->toTimeString(),
            'check_out_lon'   => $data['check_out_lon'],
            'check_out_lat'   => $data['check_out_lat'],
            'time_out_status' => $this->validateTime(now()->toTimeString(), 'out'),
            'loc_out_status'  => $this->validateLocation((float) $data['check_out_lon'], (float) $data['check_out_lat']),
        ]);

        return $attendance->fresh();
    }

    public function getMyAttendance(User $user, array $filters): \Illuminate\Support\Collection
    {
        $query = Attendance::where('user_id', $user->id);
        $this->applyDateFilters($query, $filters);

        return $query->orderByDesc('date')->get();
    }

    public function getUserAttendance(array $filters): ?array
    {
        $user = User::where('first_name', $filters['first_name'])
            ->where('last_name', $filters['last_name'])
            ->first();

        if (!$user) {
            return null;
        }

        $query = Attendance::where('user_id', $user->id);
        $this->applyDateFilters($query, $filters);

        return [
            'user'       => $user->only(['id', 'first_name', 'last_name']),
            'attendance' => $query->orderByDesc('date')->get(),
        ];
    }

    public function getAllUsersAttendance(array $filters): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = Attendance::query();
        $this->applyDateFilters($query, $filters);

        if (!empty($filters['full_name'])) {
            $query->where('full_name', 'like', '%' . $filters['full_name'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('time_in_status', $filters['status']);
        }

        return $query->orderByDesc('date')->paginate(20);
    }

    public function findUserByName(string $firstName, string $lastName): ?User
    {
        return User::where('first_name', $firstName)
            ->where('last_name', $lastName)
            ->first();
    }

    private function applyDateFilters($query, array $filters): void
    {
        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('date', [$filters['start_date'], $filters['end_date']]);
        } elseif (!empty($filters['date'])) {
            $query->whereDate('date', $filters['date']);
        }
    }
}
