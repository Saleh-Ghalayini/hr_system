<?php

namespace App\Services;

use App\Models\User;
use App\Models\Attendance;
use App\Models\AttendanceSetting;

class AttendanceService
{
    private function hasConfiguredCompanyLocation(?AttendanceSetting $settings): bool
    {
        if (!$settings) {
            return false;
        }

        $lat = $settings->company_lat;
        $lon = $settings->company_lon;

        if ($lat === null || $lon === null) {
            return false;
        }

        // Treat 0,0 as an unconfigured geofence to avoid forcing manual reviews.
        return !((float) $lat === 0.0 && (float) $lon === 0.0);
    }

    private function getSettings(): ?AttendanceSetting
    {
        try {
            return AttendanceSetting::current();
        } catch (\Throwable $e) {
            // Keep service usable in isolated unit tests where DB is not bootstrapped.
            return null;
        }
    }

    public function validateLocation(float $longitude, float $latitude): string
    {
        if ($longitude < -180 || $longitude > 180 || $latitude < -90 || $latitude > 90) {
            return 'Invalid location';
        }

        $settings = $this->getSettings();
        $maxRadiusMeters = (int) ($settings?->max_radius_meters ?? 100);
        $allowRemoteCheckIn = (bool) ($settings?->allow_remote_checkin ?? false);

        if ($allowRemoteCheckIn || !$this->hasConfiguredCompanyLocation($settings)) {
            return 'Approved';
        }

        $userLat    = deg2rad($latitude);
        $userLon    = deg2rad($longitude);
        $companyLat = deg2rad((float) ($settings?->company_lat ?? env('COMPANY_LAT', 0)));
        $companyLon = deg2rad((float) ($settings?->company_lon ?? env('COMPANY_LON', 0)));

        $dlat  = $companyLat - $userLat;
        $dlon  = $companyLon - $userLon;
        $angle = 2 * asin(sqrt(
            pow(sin($dlat / 2), 2) +
                cos($userLat) * cos($companyLat) * pow(sin($dlon / 2), 2)
        ));

        $distance = $angle * 6371000;
        return $distance > $maxRadiusMeters ? 'Review needed' : 'Approved';
    }

    private function resolveLocationStatus(?float $longitude, ?float $latitude): string
    {
        $settings = $this->getSettings();
        $requireLocation = (bool) ($settings?->require_location ?? true);

        if (!$requireLocation) {
            return 'Approved';
        }

        if ($longitude === null || $latitude === null) {
            return 'Review needed';
        }

        return $this->validateLocation($longitude, $latitude);
    }

    public function validateTime(string $time, string $type): string
    {
        $settings = $this->getSettings();
        $t         = \Carbon\Carbon::parse($time);
        $startTime = \Carbon\Carbon::parse((string) ($settings?->work_start ?? env('COMPANY_START_TIME', '09:00:00')));
        $endTime   = \Carbon\Carbon::parse((string) ($settings?->work_end ?? env('COMPANY_END_TIME', '17:00:00')));
        $lateThreshold = (int) ($settings?->late_threshold_minutes ?? 0);

        if ($type === 'in') {
            return $t->greaterThan($startTime->copy()->addMinutes($lateThreshold)) ? 'Late' : 'On-time';
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
        $timeInStatus = $this->validateTime(now()->toTimeString(), 'in');
        $checkInLon = isset($data['check_in_lon']) ? (float) $data['check_in_lon'] : null;
        $checkInLat = isset($data['check_in_lat']) ? (float) $data['check_in_lat'] : null;

        return Attendance::create([
            'user_id'        => $user->id,
            'full_name'      => trim($user->first_name . ' ' . $user->last_name),
            'date'           => now()->toDateString(),
            'check_in'       => now()->toTimeString(),
            'check_in_lon'   => $checkInLon,
            'check_in_lat'   => $checkInLat,
            'status'         => $timeInStatus === 'Late' ? 'Late' : 'Present',
            'time_in_status' => $timeInStatus,
            'loc_in_status'  => $this->resolveLocationStatus($checkInLon, $checkInLat),
        ]);
    }

    public function processCheckOut(User $user, array $data): Attendance
    {
        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', now()->toDateString())
            ->firstOrFail();

        $checkOutTime = now()->toTimeString();
        $checkIn  = \Carbon\Carbon::parse($attendance->check_in);
        $checkOut = \Carbon\Carbon::parse($checkOutTime);
        $workingHours = $checkIn->diffInMinutes($checkOut) / 60;
        $timeOutStatus = $this->validateTime($checkOutTime, 'out');
        $checkOutLon = isset($data['check_out_lon']) ? (float) $data['check_out_lon'] : null;
        $checkOutLat = isset($data['check_out_lat']) ? (float) $data['check_out_lat'] : null;

        $status = $attendance->time_in_status === 'Late' ? 'Late' : 'Present';
        if ($status !== 'Late' && $timeOutStatus === 'Early') {
            $status = 'Early';
        }

        $attendance->update([
            'check_out'       => $checkOutTime,
            'check_out_lon'   => $checkOutLon,
            'check_out_lat'   => $checkOutLat,
            'status'          => $status,
            'time_out_status' => $timeOutStatus,
            'loc_out_status'  => $this->resolveLocationStatus($checkOutLon, $checkOutLat),
            'working_hours'   => round($workingHours, 2),
        ]);

        return $attendance->fresh();
    }

    public function getMyAttendance(User $user, array $filters): \Illuminate\Support\Collection
    {
        $query = Attendance::where('user_id', $user->id);
        $this->applyDateFilters($query, $filters);

        return $query->orderByDesc('date')->orderByDesc('check_in')->get();
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
            'attendance' => $query->orderByDesc('date')->orderByDesc('check_in')->get(),
        ];
    }

    public function getAttendanceByUserId(int $userId, array $filters): ?array
    {
        $user = User::find($userId);

        if (!$user) {
            return null;
        }

        $query = Attendance::where('user_id', $user->id);
        $this->applyDateFilters($query, $filters);

        return [
            'user'       => $user->only(['id', 'first_name', 'last_name']),
            'attendance' => $query->orderByDesc('date')->orderByDesc('check_in')->get(),
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

        return $query->orderByDesc('date')->orderByDesc('check_in')->paginate(20);
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
