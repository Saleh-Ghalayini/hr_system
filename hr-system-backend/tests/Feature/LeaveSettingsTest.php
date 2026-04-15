<?php

namespace Tests\Feature;

use App\Models\LeaveBalance;
use App\Models\LeaveType;
use Tests\TestCase;

class LeaveSettingsTest extends TestCase
{
    private function seedLeaveTypes(): void
    {
        $types = [
            ['name' => 'annual', 'max_days' => 15, 'is_balance_exempt' => false],
            ['name' => 'sick', 'max_days' => 15, 'is_balance_exempt' => false],
            ['name' => 'casual', 'max_days' => 10, 'is_balance_exempt' => false],
            ['name' => 'pto', 'max_days' => 10, 'is_balance_exempt' => false],
            ['name' => 'unpaid', 'max_days' => 0, 'is_balance_exempt' => true],
            ['name' => 'maternity', 'max_days' => 0, 'is_balance_exempt' => true],
            ['name' => 'paternity', 'max_days' => 0, 'is_balance_exempt' => true],
            ['name' => 'bereavement', 'max_days' => 0, 'is_balance_exempt' => true],
            ['name' => 'other', 'max_days' => 5, 'is_balance_exempt' => false],
        ];

        foreach ($types as $type) {
            LeaveType::query()->updateOrCreate(
                ['name' => $type['name']],
                $type
            );
        }
    }

    private function tomorrow(): string
    {
        return now()->addDay()->toDateString();
    }

    private function dayAfterTomorrow(): string
    {
        return now()->addDays(2)->toDateString();
    }

    public function test_admin_can_get_leave_settings(): void
    {
        $this->seedLeaveTypes();

        $admin = $this->createUser(['role' => 'admin']);

        $response = $this->actingAsJwt($admin)->getJson('/api/v1/admin/leave/settings');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(9, 'data.types')
            ->assertJsonStructure([
                'data' => [
                    'types' => [
                        ['name', 'max_days', 'is_balance_exempt'],
                    ],
                ],
            ]);
    }

    public function test_admin_can_update_leave_settings(): void
    {
        $this->seedLeaveTypes();

        $admin = $this->createUser(['role' => 'admin']);

        $response = $this->actingAsJwt($admin)->putJson('/api/v1/admin/leave/settings', [
            'types' => [
                ['name' => 'annual', 'max_days' => 20, 'is_balance_exempt' => false],
                ['name' => 'sick', 'max_days' => 15, 'is_balance_exempt' => false],
                ['name' => 'casual', 'max_days' => 10, 'is_balance_exempt' => false],
                ['name' => 'pto', 'max_days' => 10, 'is_balance_exempt' => false],
                ['name' => 'unpaid', 'max_days' => 0, 'is_balance_exempt' => true],
                ['name' => 'maternity', 'max_days' => 0, 'is_balance_exempt' => true],
                ['name' => 'paternity', 'max_days' => 0, 'is_balance_exempt' => true],
                ['name' => 'bereavement', 'max_days' => 0, 'is_balance_exempt' => true],
                ['name' => 'other', 'max_days' => 5, 'is_balance_exempt' => false],
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('leave_types', [
            'name' => 'annual',
            'max_days' => 20,
            'is_balance_exempt' => 0,
        ]);
    }

    public function test_non_admin_cannot_access_leave_settings(): void
    {
        $this->seedLeaveTypes();

        $manager = $this->createUser(['role' => 'manager']);

        $this->actingAsJwt($manager)
            ->getJson('/api/v1/admin/leave/settings')
            ->assertStatus(403);
    }

    public function test_balance_exempt_setting_is_respected_for_leave_request_validation(): void
    {
        $this->seedLeaveTypes();

        $user = $this->createUser(['role' => 'user']);

        LeaveType::query()->where('name', 'annual')->update([
            'is_balance_exempt' => true,
            'max_days' => 0,
        ]);

        LeaveBalance::query()->where('user_id', $user->id)->update([
            'balances' => ['annual' => 0, 'sick' => 15, 'casual' => 10, 'pto' => 10, 'other' => 5],
        ]);

        $response = $this->actingAsJwt($user)->postJson('/api/v1/leave/requests', [
            'leave_type' => 'annual',
            'start_date' => $this->tomorrow(),
            'end_date' => $this->dayAfterTomorrow(),
            'reason' => 'Policy exception test',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.leave_type', 'annual')
            ->assertJsonPath('data.status', 'pending');
    }
}
