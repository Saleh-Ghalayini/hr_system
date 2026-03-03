<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;

class LeaveTest extends TestCase
{
    private function tomorrow(): string
    {
        return now()->addDay()->toDateString();
    }

    private function dayAfterTomorrow(): string
    {
        return now()->addDays(2)->toDateString();
    }

    // ─── Submit Leave Request ─────────────────────────────────────────────────

    public function test_user_can_submit_leave_request(): void
    {
        $user = $this->createUser();

        $response = $this->actingAsJwt($user)->postJson('/api/v1/leave/requests', [
            'leave_type' => 'annual',
            'start_date' => $this->tomorrow(),
            'end_date'   => $this->tomorrow(),
            'reason'     => 'Personal appointment',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.user_id', $user->id);
    }

    public function test_leave_request_requires_valid_leave_type(): void
    {
        $user = $this->createUser();

        $response = $this->actingAsJwt($user)->postJson('/api/v1/leave/requests', [
            'leave_type' => 'vacation',   // invalid type
            'start_date' => $this->tomorrow(),
            'end_date'   => $this->tomorrow(),
            'reason'     => 'Trip',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.leave_type', fn($v) => !empty($v));
    }

    public function test_leave_request_requires_future_dates(): void
    {
        $user = $this->createUser();

        $response = $this->actingAsJwt($user)->postJson('/api/v1/leave/requests', [
            'leave_type' => 'sick',
            'start_date' => '2000-01-01',  // past date
            'end_date'   => '2000-01-02',
            'reason'     => 'Sick',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.start_date', fn($v) => !empty($v));
    }

    public function test_leave_request_rejected_when_balance_insufficient(): void
    {
        $user = $this->createUser();

        // Set balance to 0 for annual leave
        LeaveBalance::where('user_id', $user->id)->update([
            'balances' => ['annual' => 0, 'sick' => 15, 'casual' => 10, 'other' => 5],
        ]);

        $response = $this->actingAsJwt($user)->postJson('/api/v1/leave/requests', [
            'leave_type' => 'annual',
            'start_date' => $this->tomorrow(),
            'end_date'   => $this->dayAfterTomorrow(),
            'reason'     => 'Holiday',
        ]);

        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }

    public function test_unauthenticated_cannot_submit_leave_request(): void
    {
        $response = $this->postJson('/api/v1/leave/requests', [
            'leave_type' => 'annual',
            'start_date' => $this->tomorrow(),
            'end_date'   => $this->tomorrow(),
            'reason'     => 'Holiday',
        ]);

        $response->assertStatus(401);
    }

    // ─── Get Own Leave Requests ───────────────────────────────────────────────

    public function test_user_can_get_own_leave_requests(): void
    {
        $user = $this->createUser();

        LeaveRequest::create([
            'user_id'    => $user->id,
            'leave_type' => 'annual',
            'start_date' => $this->tomorrow(),
            'end_date'   => $this->tomorrow(),
            'status'     => 'pending',
            'reason'     => 'Rest',
        ]);

        $response = $this->actingAsJwt($user)->getJson('/api/v1/leave/requests');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // ─── Manager Approval ─────────────────────────────────────────────────────

    public function test_manager_can_approve_leave_request(): void
    {
        $manager = $this->createUser(['role' => 'manager']);
        $user    = $this->createUser(['role' => 'user', 'manager_id' => $manager->id]);

        $leave = LeaveRequest::create([
            'user_id'    => $user->id,
            'leave_type' => 'annual',
            'start_date' => $this->tomorrow(),
            'end_date'   => $this->tomorrow(),
            'status'     => 'pending',
            'reason'     => 'Rest',
        ]);

        $response = $this->actingAsJwt($manager)
            ->putJson("/api/v1/leave/requests/{$leave->id}", ['status' => 'approved']);

        $response->assertOk()
            ->assertJsonPath('data.status', 'approved');
    }

    public function test_approved_leave_deducts_from_balance(): void
    {
        $manager = $this->createUser(['role' => 'manager']);
        $user    = $this->createUser(['role' => 'user', 'manager_id' => $manager->id]);

        $balanceBefore = LeaveBalance::where('user_id', $user->id)->first()->balances['annual'];

        $leave = LeaveRequest::create([
            'user_id'    => $user->id,
            'leave_type' => 'annual',
            'start_date' => $this->tomorrow(),
            'end_date'   => $this->tomorrow(),  // 1 day
            'status'     => 'pending',
            'reason'     => 'Rest',
        ]);

        $this->actingAsJwt($manager)
            ->putJson("/api/v1/leave/requests/{$leave->id}", ['status' => 'approved']);

        $balanceAfter = LeaveBalance::where('user_id', $user->id)->first()->balances['annual'];

        $this->assertEquals($balanceBefore - 1, $balanceAfter);
    }

    public function test_manager_can_reject_leave_request(): void
    {
        $manager = $this->createUser(['role' => 'manager']);
        $user    = $this->createUser(['role' => 'user', 'manager_id' => $manager->id]);

        $leave = LeaveRequest::create([
            'user_id'    => $user->id,
            'leave_type' => 'sick',
            'start_date' => $this->tomorrow(),
            'end_date'   => $this->tomorrow(),
            'status'     => 'pending',
            'reason'     => 'Unwell',
        ]);

        $balanceBefore = LeaveBalance::where('user_id', $user->id)->first()->balances['sick'];

        $response = $this->actingAsJwt($manager)
            ->putJson("/api/v1/leave/requests/{$leave->id}", ['status' => 'rejected']);

        $response->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        // Balance must NOT change on rejection
        $balanceAfter = LeaveBalance::where('user_id', $user->id)->first()->balances['sick'];
        $this->assertEquals($balanceBefore, $balanceAfter);
    }

    public function test_already_processed_leave_cannot_be_updated_again(): void
    {
        $manager = $this->createUser(['role' => 'manager']);
        $user    = $this->createUser(['role' => 'user', 'manager_id' => $manager->id]);

        // Already approved
        $leave = LeaveRequest::create([
            'user_id'    => $user->id,
            'leave_type' => 'annual',
            'start_date' => $this->tomorrow(),
            'end_date'   => $this->tomorrow(),
            'status'     => 'approved',
            'reason'     => 'Already approved',
        ]);

        $response = $this->actingAsJwt($manager)
            ->putJson("/api/v1/leave/requests/{$leave->id}", ['status' => 'rejected']);

        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }

    public function test_regular_user_cannot_approve_leave(): void
    {
        $user  = $this->createUser(['role' => 'user']);
        $other = $this->createUser(['role' => 'user']);

        $leave = LeaveRequest::create([
            'user_id'    => $other->id,
            'leave_type' => 'annual',
            'start_date' => $this->tomorrow(),
            'end_date'   => $this->tomorrow(),
            'status'     => 'pending',
            'reason'     => 'Holiday',
        ]);

        $response = $this->actingAsJwt($user)
            ->putJson("/api/v1/leave/requests/{$leave->id}", ['status' => 'approved']);

        $response->assertStatus(403);
    }
}
