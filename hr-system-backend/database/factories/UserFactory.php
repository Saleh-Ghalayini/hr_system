<?php

namespace Database\Factories;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'first_name'        => fake()->firstName(),
            'last_name'         => fake()->lastName(),
            'email'             => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password'          => static::$password ??= Hash::make('password'),
            'remember_token'    => Str::random(10),
            'date_of_birth'     => fake()->date('Y-m-d', '-20 years'),
            'nationality'       => fake()->country(),
            'phone_number'      => fake()->numerify('7########'),
            'address'           => fake()->address(),
            'position'          => fake()->randomElement(['Intern', 'Junior', 'Senior', 'Executive']),
            'gender'            => fake()->randomElement(['male', 'female']),
            'insurance_id'      => fake()->numberBetween(1, 3),
            'role'              => 'user',
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'admin',
        ]);
    }

    public function manager(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'manager',
        ]);
    }
}
