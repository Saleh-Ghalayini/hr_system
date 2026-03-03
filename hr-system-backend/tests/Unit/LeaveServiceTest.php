<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\LeaveService;
use App\Models\LeaveBalance;

class LeaveServiceTest extends TestCase
{
    private LeaveService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new LeaveService();
    }

    // ─── calculateDays ────────────────────────────────────────────────────────

    public function test_calculate_days_returns_one_for_same_day(): void
    {
        $days = $this->service->calculateDays('2026-04-10', '2026-04-10');

        $this->assertSame(1, $days);
    }

    public function test_calculate_days_returns_correct_count_for_range(): void
    {
        $days = $this->service->calculateDays('2026-04-10', '2026-04-12');

        $this->assertSame(3, $days);
    }

    public function test_calculate_days_returns_correct_count_across_month_boundary(): void
    {
        $days = $this->service->calculateDays('2026-04-29', '2026-05-01');

        $this->assertSame(3, $days);
    }

    // ─── validateBalance ──────────────────────────────────────────────────────

    public function test_validate_balance_returns_null_when_balance_is_sufficient(): void
    {
        $balance          = new LeaveBalance();
        $balance->balances = ['annual' => 10, 'sick' => 5, 'casual' => 3, 'other' => 2];

        $result = $this->service->validateBalance($balance, 'annual', 5);

        $this->assertNull($result);
    }

    public function test_validate_balance_returns_null_when_balance_exactly_matches_request(): void
    {
        $balance          = new LeaveBalance();
        $balance->balances = ['annual' => 3, 'sick' => 0, 'casual' => 0, 'other' => 0];

        $result = $this->service->validateBalance($balance, 'annual', 3);

        $this->assertNull($result);
    }

    public function test_validate_balance_returns_error_string_when_insufficient(): void
    {
        $balance          = new LeaveBalance();
        $balance->balances = ['annual' => 2, 'sick' => 5, 'casual' => 3, 'other' => 2];

        $result = $this->service->validateBalance($balance, 'annual', 5);

        $this->assertIsString($result);
        $this->assertStringContainsString('annual', $result);
    }

    public function test_validate_balance_returns_error_when_balance_is_zero(): void
    {
        $balance          = new LeaveBalance();
        $balance->balances = ['annual' => 0, 'sick' => 5, 'casual' => 3, 'other' => 2];

        $result = $this->service->validateBalance($balance, 'annual', 1);

        $this->assertIsString($result);
    }

    public function test_validate_balance_treats_missing_leave_type_as_zero(): void
    {
        $balance          = new LeaveBalance();
        $balance->balances = ['annual' => 10];  // 'sick' not present

        $result = $this->service->validateBalance($balance, 'sick', 1);

        $this->assertIsString($result);
    }
}
