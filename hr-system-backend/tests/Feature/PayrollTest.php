<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Payroll;
use App\Models\BaseSalary;

class PayrollTest extends TestCase
{
    // ─── Admin: All Payrolls ──────────────────────────────────────────────────

    public function test_admin_can_get_all_payrolls(): void
    {
        $admin = $this->createUser(['role' => 'admin']);
        $this->createUser(['role' => 'user']);

        $response = $this->actingAsJwt($admin)->getJson('/api/v1/admin/payroll');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data']);

        $this->assertGreaterThanOrEqual(2, count($response->json('data')));
    }

    public function test_non_admin_cannot_access_admin_payroll_list(): void
    {
        $user = $this->createUser(['role' => 'user']);

        $response = $this->actingAsJwt($user)->getJson('/api/v1/admin/payroll');

        $response->assertStatus(403);
    }

    public function test_manager_cannot_access_admin_payroll_list(): void
    {
        $manager = $this->createUser(['role' => 'manager']);

        $response = $this->actingAsJwt($manager)->getJson('/api/v1/admin/payroll');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_get_payroll(): void
    {
        $response = $this->getJson('/api/v1/admin/payroll');

        $response->assertStatus(401);
    }

    // ─── Employee: Own Payroll ────────────────────────────────────────────────

    public function test_employee_can_get_own_payroll(): void
    {
        $user = $this->createUser(['role' => 'user']);

        $response = $this->actingAsJwt($user)->getJson('/api/v1/profile/payroll');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user_id', $user->id);
    }

    public function test_own_payroll_includes_insurance_and_salary_details(): void
    {
        $user = $this->createUser(['role' => 'user', 'position' => 'Junior']);

        $response = $this->actingAsJwt($user)->getJson('/api/v1/profile/payroll');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['user_id', 'total', 'position', 'insurance', 'base_salary'],
            ]);
    }

    public function test_unauthenticated_cannot_get_own_payroll(): void
    {
        $response = $this->getJson('/api/v1/profile/payroll');

        $response->assertStatus(401);
    }

    // ─── Observer: Auto-create Payroll ───────────────────────────────────────

    public function test_payroll_is_created_automatically_when_user_is_registered(): void
    {
        $user = $this->createUser(['position' => 'Junior']);

        $payroll = Payroll::where('user_id', $user->id)->first();

        $this->assertNotNull($payroll, 'Payroll should be auto-created by UserObserver');
        $this->assertEquals($user->id, $payroll->user_id);
        $this->assertEquals('Junior', $payroll->position);
    }

    public function test_payroll_total_matches_base_salary_for_position(): void
    {
        $baseSalary = BaseSalary::where('position', 'Junior')->first();
        $user       = $this->createUser(['position' => 'Junior']);

        $payroll = Payroll::where('user_id', $user->id)->first();

        $this->assertEquals($baseSalary->salary, $payroll->total);
    }

    public function test_payroll_updates_when_user_position_changes(): void
    {
        BaseSalary::firstOrCreate(['position' => 'Senior'], ['salary' => 1600]);

        $user = $this->createUser(['position' => 'Junior']);

        $user->update(['position' => 'Senior']);

        $payroll = Payroll::where('user_id', $user->id)->first();

        $this->assertEquals('Senior', $payroll->position);
        $this->assertEquals(1600, $payroll->total);
    }
}
