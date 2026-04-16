<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Payroll;
use App\Models\BaseSalary;
use App\Models\Tax;

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
        $baseSalary = BaseSalary::firstOrCreate(['position' => 'Junior'], ['salary' => 1200]);
        $user       = $this->createUser(['position' => 'Junior']);

        $payroll = Payroll::where('user_id', $user->id)->first();
        $insurance = $user->insurance()->first();
        $tax = Tax::first();
        $expected = round(
            $baseSalary->salary
                - ($insurance?->cost ?? 0)
                - ($baseSalary->salary * (($tax?->rate ?? 0) / 100)),
            2
        );

        $this->assertEquals($expected, $payroll->total);
    }

    public function test_payroll_updates_when_user_position_changes(): void
    {
        BaseSalary::firstOrCreate(['position' => 'Senior'], ['salary' => 1600]);

        $user = $this->createUser(['position' => 'Junior']);

        $user->update(['position' => 'Senior']);

        $payroll = Payroll::where('user_id', $user->id)->first();
        $insurance = $user->insurance()->first();
        $tax = Tax::first();
        $expected = round(
            1600
                - ($insurance?->cost ?? 0)
                - (1600 * (($tax?->rate ?? 0) / 100)),
            2
        );

        $this->assertEquals('Senior', $payroll->position);
        $this->assertEquals($expected, $payroll->total);
    }

    public function test_admin_can_recalculate_payroll_total(): void
    {
        $admin = $this->createUser(['role' => 'admin']);
        $user  = $this->createUser(['role' => 'user', 'position' => 'Junior']);

        $payroll = Payroll::where('user_id', $user->id)->first();
        $payroll->update([
            'overtime_hours' => 10,
            'overtime_rate'  => 2,
            'bonus'          => 100,
            'allowances'     => 50,
            'deductions'     => 20,
            'extra_leaves'   => 1,
            'total'          => 0,
        ]);

        $payroll->load(['baseSalary', 'insurance', 'tax']);
        $base = $payroll->baseSalary?->salary ?? 0;
        $insurance = $payroll->insurance?->cost ?? 0;
        $taxRate = $payroll->tax?->rate ?? 0;
        $taxAmount = $base * ($taxRate / 100);
        $dailyRate = $base / 22;
        $leaveDeduct = $payroll->extra_leaves * $dailyRate;
        $overtimePay = $payroll->overtime_hours * ($base / 160) * $payroll->overtime_rate;
        $expected = round(
            $base
                - $insurance
                - $taxAmount
                - $leaveDeduct
                - $payroll->deductions
                + $payroll->bonus
                + $payroll->allowances
                + $overtimePay,
            2
        );

        $response = $this->actingAsJwt($admin)
            ->postJson('/api/v1/admin/payroll/recalculate/' . $payroll->id);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', $expected);
    }

    public function test_paid_payroll_cannot_be_updated_or_recalculated(): void
    {
        $admin = $this->createUser(['role' => 'admin']);
        $user  = $this->createUser(['role' => 'user']);

        $payroll = Payroll::where('user_id', $user->id)->first();
        $payroll->update(['status' => 'paid']);

        $updateResponse = $this->actingAsJwt($admin)
            ->putJson('/api/v1/admin/payroll/' . $payroll->id, ['bonus' => 100]);

        $updateResponse->assertStatus(422);

        $recalcResponse = $this->actingAsJwt($admin)
            ->postJson('/api/v1/admin/payroll/recalculate/' . $payroll->id);

        $recalcResponse->assertStatus(422);
    }
}
