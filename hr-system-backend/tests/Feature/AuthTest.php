<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    // ─── Login ────────────────────────────────────────────────────────────────

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = $this->createUser(['password' => bcrypt('secret123')]);

        $response = $this->postJson('/api/v1/guest/login', [
            'email'    => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['success', 'data' => ['token', 'role', 'id']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = $this->createUser(['password' => bcrypt('correct')]);

        $response = $this->postJson('/api/v1/guest/login', [
            'email'    => $user->email,
            'password' => 'wrong',
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/v1/guest/login', []);

        $response->assertStatus(422)
            ->assertJsonStructure(['success', 'errors']);
    }

    public function test_login_requires_valid_email_format(): void
    {
        $response = $this->postJson('/api/v1/guest/login', [
            'email'    => 'not-an-email',
            'password' => 'secret123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.email', fn($v) => !empty($v));
    }

    // ─── Register ─────────────────────────────────────────────────────────────

    public function test_user_can_register(): void
    {
        // The observer needs an insurance record to assign to the new user
        \App\Models\Insurance::firstOrCreate(['type' => 'TEST'], ['cost' => 50, 'old_cost' => 50]);
        \App\Models\BaseSalary::firstOrCreate(['position' => 'Junior'], ['salary' => 800]);

        $insurance = \App\Models\Insurance::first();

        $response = $this->postJson('/api/v1/guest/register', [
            'first_name'    => 'John',
            'last_name'     => 'Doe',
            'email'         => 'john.doe@example.com',
            'password'      => 'SecurePass123',
            'date_of_birth' => '1995-06-15',
            'nationality'   => 'Lebanese',
            'phone_number'  => '71234567',
            'address'       => 'Beirut',
            'position'      => 'Junior',
            'gender'        => 'male',
            'role'          => 'user',
            'insurance_id'  => $insurance->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['token', 'role', 'id', 'email']]);
    }

    public function test_register_fails_with_duplicate_email(): void
    {
        $existing = $this->createUser();

        $insurance = \App\Models\Insurance::first();

        $response = $this->postJson('/api/v1/guest/register', [
            'first_name'    => 'Jane',
            'last_name'     => 'Smith',
            'email'         => $existing->email,  // same email
            'password'      => 'SecurePass123',
            'date_of_birth' => '1995-06-15',
            'nationality'   => 'Lebanese',
            'phone_number'  => '71234568',
            'address'       => 'Tripoli',
            'position'      => 'Junior',
            'gender'        => 'female',
            'role'          => 'user',
            'insurance_id'  => $insurance->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.email', fn($v) => !empty($v));
    }

    // ─── Token Validation ─────────────────────────────────────────────────────

    public function test_validate_token_returns_user_data(): void
    {
        $user = $this->createUser();

        $response = $this->actingAsJwt($user)
            ->getJson('/api/v1/validate-token');

        $response->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonStructure(['data' => ['id', 'first_name', 'last_name', 'email', 'role']]);
    }

    public function test_unauthenticated_validate_token_returns_401(): void
    {
        $response = $this->getJson('/api/v1/validate-token');

        $response->assertStatus(401);
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    public function test_user_can_logout(): void
    {
        $user = $this->createUser();

        $response = $this->actingAsJwt($user)
            ->postJson('/api/v1/logout');

        $response->assertOk()
            ->assertJson(['success' => true]);
    }

    public function test_unauthenticated_logout_returns_401(): void
    {
        $response = $this->postJson('/api/v1/logout');

        $response->assertStatus(401);
    }
}
