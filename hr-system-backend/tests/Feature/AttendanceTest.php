<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Attendance;
use App\Models\AttendanceSetting;
use Carbon\Carbon;
use Illuminate\Database\QueryException;

class AttendanceTest extends TestCase
{
    // Coordinates that fall within 100 m of (0, 0) — the default company location
    private const NEAR_LAT = 0.0005;
    private const NEAR_LON = 0.0005;

    // ─── Check-in ─────────────────────────────────────────────────────────────

    public function test_user_can_check_in(): void
    {
        $user = $this->createUser();

        $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-in', [
            'check_in_lat' => self::NEAR_LAT,
            'check_in_lon' => self::NEAR_LON,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['id', 'user_id', 'date', 'check_in']]);

        $this->assertDatabaseHas('attendances', [
            'user_id' => $user->id,
            'date'    => now()->toDateString(),
        ]);
    }

    public function test_check_in_respects_configured_geofence_radius(): void
    {
        $user = $this->createUser();

        AttendanceSetting::current()->update([
            'company_lat' => 33.8938,
            'company_lon' => 35.5018,
            'max_radius_meters' => 30,
        ]);

        $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-in', [
            // Deliberately outside the 30m radius from company coordinates.
            'check_in_lat' => 33.8950,
            'check_in_lon' => 35.5018,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.loc_in_status', 'Review needed');
    }

    public function test_check_in_respects_late_threshold_setting(): void
    {
        $user = $this->createUser();

        AttendanceSetting::current()->update([
            'work_start' => '09:00:00',
            'late_threshold_minutes' => 5,
        ]);

        Carbon::setTestNow(Carbon::parse('2026-04-15 09:06:00'));

        try {
            $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-in', [
                'check_in_lat' => self::NEAR_LAT,
                'check_in_lon' => self::NEAR_LON,
            ]);

            $response->assertOk()
                ->assertJsonPath('data.time_in_status', 'Late')
                ->assertJsonPath('data.status', 'Late');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_check_in_without_coordinates_when_location_not_required(): void
    {
        $user = $this->createUser();

        AttendanceSetting::current()->update([
            'require_location' => false,
        ]);

        $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-in', []);

        $response->assertOk()
            ->assertJsonPath('data.loc_in_status', 'Approved')
            ->assertJsonPath('data.check_in_lon', null)
            ->assertJsonPath('data.check_in_lat', null);
    }

    public function test_check_in_is_approved_when_remote_checkin_is_enabled(): void
    {
        $user = $this->createUser();

        AttendanceSetting::current()->update([
            'company_lat' => 0,
            'company_lon' => 0,
            'max_radius_meters' => 30,
            'allow_remote_checkin' => true,
            'require_location' => true,
        ]);

        $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-in', [
            'check_in_lat' => 33.8938,
            'check_in_lon' => 35.5018,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.loc_in_status', 'Approved');
    }

    public function test_user_cannot_check_in_twice_on_same_day(): void
    {
        $user = $this->createUser();

        Attendance::create([
            'user_id'        => $user->id,
            'full_name'      => $user->first_name . ' ' . $user->last_name,
            'date'           => now()->toDateString(),
            'check_in'       => now()->toTimeString(),
            'check_in_lat'   => self::NEAR_LAT,
            'check_in_lon'   => self::NEAR_LON,
            'time_in_status' => 'On-time',
            'loc_in_status'  => 'Approved',
        ]);

        $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-in', [
            'check_in_lat' => self::NEAR_LAT,
            'check_in_lon' => self::NEAR_LON,
        ]);

        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }

    public function test_check_in_requires_coordinates(): void
    {
        $user = $this->createUser();

        $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-in', []);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors']);
    }

    public function test_unauthenticated_cannot_check_in(): void
    {
        $response = $this->postJson('/api/v1/attendance/check-in', [
            'check_in_lat' => self::NEAR_LAT,
            'check_in_lon' => self::NEAR_LON,
        ]);

        $response->assertStatus(401);
    }

    // ─── Check-out ────────────────────────────────────────────────────────────

    public function test_user_cannot_check_out_without_checking_in(): void
    {
        $user = $this->createUser();

        $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-out', [
            'check_out_lat' => self::NEAR_LAT,
            'check_out_lon' => self::NEAR_LON,
        ]);

        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }

    public function test_user_can_check_out_after_checking_in(): void
    {
        $user = $this->createUser();

        Attendance::create([
            'user_id'        => $user->id,
            'full_name'      => $user->first_name . ' ' . $user->last_name,
            'date'           => now()->toDateString(),
            'check_in'       => now()->subHours(8)->toTimeString(),
            'check_in_lat'   => self::NEAR_LAT,
            'check_in_lon'   => self::NEAR_LON,
            'time_in_status' => 'On-time',
            'loc_in_status'  => 'Approved',
        ]);

        $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-out', [
            'check_out_lat' => self::NEAR_LAT,
            'check_out_lon' => self::NEAR_LON,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['check_out']]);
    }

    public function test_check_out_updates_status_to_early_when_user_leaves_before_end_time(): void
    {
        $user = $this->createUser();

        AttendanceSetting::current()->update([
            'work_end' => '17:00:00',
        ]);

        Attendance::create([
            'user_id'        => $user->id,
            'full_name'      => $user->first_name . ' ' . $user->last_name,
            'date'           => '2026-04-15',
            'check_in'       => '08:50:00',
            'check_in_lat'   => self::NEAR_LAT,
            'check_in_lon'   => self::NEAR_LON,
            'status'         => 'Present',
            'time_in_status' => 'On-time',
            'loc_in_status'  => 'Approved',
        ]);

        Carbon::setTestNow(Carbon::parse('2026-04-15 16:00:00'));

        try {
            $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-out', [
                'check_out_lat' => self::NEAR_LAT,
                'check_out_lon' => self::NEAR_LON,
            ]);

            $response->assertOk()
                ->assertJsonPath('data.time_out_status', 'Early')
                ->assertJsonPath('data.status', 'Early');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_check_out_without_coordinates_when_location_not_required(): void
    {
        $user = $this->createUser();

        AttendanceSetting::current()->update([
            'require_location' => false,
        ]);

        Attendance::create([
            'user_id'        => $user->id,
            'full_name'      => $user->first_name . ' ' . $user->last_name,
            'date'           => now()->toDateString(),
            'check_in'       => now()->subHours(8)->toTimeString(),
            'check_in_lat'   => null,
            'check_in_lon'   => null,
            'status'         => 'Present',
            'time_in_status' => 'On-time',
            'loc_in_status'  => 'Approved',
        ]);

        $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-out', []);

        $response->assertOk()
            ->assertJsonPath('data.loc_out_status', 'Approved')
            ->assertJsonPath('data.check_out_lon', null)
            ->assertJsonPath('data.check_out_lat', null);
    }

    public function test_user_cannot_check_out_twice(): void
    {
        $user = $this->createUser();

        Attendance::create([
            'user_id'         => $user->id,
            'full_name'       => $user->first_name . ' ' . $user->last_name,
            'date'            => now()->toDateString(),
            'check_in'        => now()->subHours(8)->toTimeString(),
            'check_in_lat'    => self::NEAR_LAT,
            'check_in_lon'    => self::NEAR_LON,
            'check_out'       => now()->toTimeString(),
            'check_out_lat'   => self::NEAR_LAT,
            'check_out_lon'   => self::NEAR_LON,
            'time_in_status'  => 'On-time',
            'loc_in_status'   => 'Approved',
            'time_out_status' => 'On-time',
            'loc_out_status'  => 'Approved',
        ]);

        $response = $this->actingAsJwt($user)->postJson('/api/v1/attendance/check-out', [
            'check_out_lat' => self::NEAR_LAT,
            'check_out_lon' => self::NEAR_LON,
        ]);

        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }

    // ─── My Attendance ────────────────────────────────────────────────────────

    public function test_user_can_get_own_attendance(): void
    {
        $user = $this->createUser();

        Attendance::create([
            'user_id'        => $user->id,
            'full_name'      => $user->first_name . ' ' . $user->last_name,
            'date'           => now()->toDateString(),
            'check_in'       => '09:00:00',
            'check_in_lat'   => self::NEAR_LAT,
            'check_in_lon'   => self::NEAR_LON,
            'time_in_status' => 'On-time',
            'loc_in_status'  => 'Approved',
        ]);

        $response = $this->actingAsJwt($user)->getJson('/api/v1/attendance/my');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }

    public function test_user_only_sees_own_attendance(): void
    {
        $userA = $this->createUser();
        $userB = $this->createUser();

        Attendance::create([
            'user_id'        => $userB->id,
            'full_name'      => $userB->first_name . ' ' . $userB->last_name,
            'date'           => now()->toDateString(),
            'check_in'       => '09:00:00',
            'check_in_lat'   => self::NEAR_LAT,
            'check_in_lon'   => self::NEAR_LON,
            'time_in_status' => 'On-time',
            'loc_in_status'  => 'Approved',
        ]);

        $response = $this->actingAsJwt($userA)->getJson('/api/v1/attendance/my');

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    // ─── Admin Full Access ────────────────────────────────────────────────────

    public function test_admin_can_get_all_attendance(): void
    {
        $admin = $this->createUser(['role' => 'admin']);

        $response = $this->actingAsJwt($admin)->getJson('/api/v1/admin/attendance/all');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_get_attendance_by_user_id(): void
    {
        $admin = $this->createUser(['role' => 'admin']);
        $employee = $this->createUser(['role' => 'user']);

        Attendance::create([
            'user_id'        => $employee->id,
            'full_name'      => $employee->first_name . ' ' . $employee->last_name,
            'date'           => now()->toDateString(),
            'check_in'       => '09:00:00',
            'check_in_lat'   => self::NEAR_LAT,
            'check_in_lon'   => self::NEAR_LON,
            'status'         => 'Present',
            'time_in_status' => 'On-time',
            'loc_in_status'  => 'Approved',
        ]);

        $response = $this->actingAsJwt($admin)->getJson('/api/v1/admin/attendance/user/' . $employee->id);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.id', $employee->id)
            ->assertJsonCount(1, 'data.attendance');
    }

    public function test_non_admin_cannot_access_all_attendance(): void
    {
        $user = $this->createUser(['role' => 'user']);

        $response = $this->actingAsJwt($user)->getJson('/api/v1/admin/attendance/all');

        $response->assertStatus(403);
    }

    public function test_attendance_table_enforces_unique_user_and_date(): void
    {
        $user = $this->createUser();

        Attendance::create([
            'user_id'        => $user->id,
            'full_name'      => $user->first_name . ' ' . $user->last_name,
            'date'           => now()->toDateString(),
            'check_in'       => '09:00:00',
            'check_in_lat'   => self::NEAR_LAT,
            'check_in_lon'   => self::NEAR_LON,
            'status'         => 'Present',
            'time_in_status' => 'On-time',
            'loc_in_status'  => 'Approved',
        ]);

        $this->expectException(QueryException::class);

        Attendance::create([
            'user_id'        => $user->id,
            'full_name'      => $user->first_name . ' ' . $user->last_name,
            'date'           => now()->toDateString(),
            'check_in'       => '09:05:00',
            'check_in_lat'   => self::NEAR_LAT,
            'check_in_lon'   => self::NEAR_LON,
            'status'         => 'Present',
            'time_in_status' => 'On-time',
            'loc_in_status'  => 'Approved',
        ]);
    }

    // ─── Attendance Settings (Admin) ───────────────────────────────────────

    public function test_admin_cannot_update_work_end_before_effective_work_start_on_partial_update(): void
    {
        $admin = $this->createUser(['role' => 'admin']);

        AttendanceSetting::current()->update([
            'work_start' => '09:00:00',
            'work_end' => '17:00:00',
        ]);

        $response = $this->actingAsJwt($admin)->putJson('/api/v1/admin/attendance-settings', [
            'work_end' => '08:30',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors' => ['work_end']]);

        $this->assertDatabaseHas('attendance_settings', [
            'work_start' => '09:00:00',
            'work_end' => '17:00:00',
        ]);
    }

    public function test_admin_update_syncs_working_days_per_week_with_working_days_payload(): void
    {
        $admin = $this->createUser(['role' => 'admin']);

        $response = $this->actingAsJwt($admin)->putJson('/api/v1/admin/attendance-settings', [
            'working_days_per_week' => 7,
            'working_days' => ['Monday', 'Wednesday', 'Friday'],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.working_days_per_week', 3)
            ->assertJsonPath('data.working_days.0', 'Monday')
            ->assertJsonPath('data.working_days.1', 'Wednesday')
            ->assertJsonPath('data.working_days.2', 'Friday');
    }
}
