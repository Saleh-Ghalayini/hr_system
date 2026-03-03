<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Attendance;

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

    public function test_non_admin_cannot_access_all_attendance(): void
    {
        $user = $this->createUser(['role' => 'user']);

        $response = $this->actingAsJwt($user)->getJson('/api/v1/admin/attendance/all');

        $response->assertStatus(403);
    }
}
