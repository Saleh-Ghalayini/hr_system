<?php

namespace Tests;

use App\Models\User;
use App\Models\Insurance;
use App\Models\BaseSalary;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /**
     * Authenticate the given user via JWT and return a test instance
     * with the Authorization header already set.
     */
    protected function actingAsJwt(User $user): static
    {
        $token = JWTAuth::fromUser($user);

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    /**
     * Create a User via the factory so that UserObserver fires, which
     * automatically creates the linked Payroll and LeaveBalance records.
     *
     * Prerequisites (Insurance, BaseSalary) are created with firstOrCreate
     * so multiple calls within the same test are safe.
     */
    protected function createUser(array $overrides = []): User
    {
        $insurance = Insurance::firstOrCreate(
            ['type' => 'TEST'],
            ['cost' => 50, 'old_cost' => 50]
        );

        foreach (['Junior' => 800, 'Senior' => 1600, 'Executive' => 2100] as $position => $salary) {
            BaseSalary::firstOrCreate(['position' => $position], ['salary' => $salary]);
        }

        return User::factory()->create(array_merge([
            'insurance_id' => $insurance->id,
            'position'     => 'Junior',
        ], $overrides));
    }
}
