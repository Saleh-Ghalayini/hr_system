<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\AttendanceService;

class AttendanceServiceTest extends TestCase
{
    private AttendanceService $service;

    protected function setUp(): void
    {
        parent::setUp();

        // Set company location to (0, 0) — the env() default — explicitly so
        // tests are not affected by any .env file present on the machine.
        putenv('COMPANY_LAT=0');
        putenv('COMPANY_LON=0');
        putenv('COMPANY_START_TIME=09:00:00');
        putenv('COMPANY_END_TIME=17:00:00');

        $this->service = new AttendanceService();
    }

    // ─── validateLocation ─────────────────────────────────────────────────────

    public function test_validate_location_returns_approved_when_within_100m(): void
    {
        // ~55 m north of (0, 0)
        $result = $this->service->validateLocation(0.0, 0.0005);

        $this->assertSame('Approved', $result);
    }

    public function test_validate_location_returns_approved_at_exact_company_coordinates(): void
    {
        $result = $this->service->validateLocation(0.0, 0.0);

        $this->assertSame('Approved', $result);
    }

    public function test_validate_location_returns_approved_when_company_location_is_unconfigured(): void
    {
        // With company location treated as unconfigured at (0,0), service approves by design.
        $result = $this->service->validateLocation(35.5018, 33.8938);

        $this->assertSame('Approved', $result);
    }

    public function test_validate_location_returns_invalid_for_latitude_out_of_range(): void
    {
        $result = $this->service->validateLocation(0.0, 91.0);

        $this->assertSame('Invalid location', $result);
    }

    public function test_validate_location_returns_invalid_for_longitude_out_of_range(): void
    {
        $result = $this->service->validateLocation(181.0, 0.0);

        $this->assertSame('Invalid location', $result);
    }

    public function test_validate_location_returns_invalid_for_negative_out_of_range(): void
    {
        $result = $this->service->validateLocation(0.0, -91.0);

        $this->assertSame('Invalid location', $result);
    }

    // ─── validateTime ─────────────────────────────────────────────────────────

    public function test_validate_time_returns_on_time_when_checking_in_before_start(): void
    {
        // 08:30 is before 09:00
        $result = $this->service->validateTime('08:30:00', 'in');

        $this->assertSame('On-time', $result);
    }

    public function test_validate_time_returns_late_when_checking_in_after_start(): void
    {
        // 09:30 is after 09:00
        $result = $this->service->validateTime('09:30:00', 'in');

        $this->assertSame('Late', $result);
    }

    public function test_validate_time_returns_on_time_when_checking_in_exactly_at_start(): void
    {
        // Exactly 09:00 is NOT greater than 09:00 → On-time
        $result = $this->service->validateTime('09:00:00', 'in');

        $this->assertSame('On-time', $result);
    }

    public function test_validate_time_returns_early_when_checking_out_before_end(): void
    {
        // 16:00 is before 17:00
        $result = $this->service->validateTime('16:00:00', 'out');

        $this->assertSame('Early', $result);
    }

    public function test_validate_time_returns_on_time_when_checking_out_after_end(): void
    {
        // 17:30 is after 17:00
        $result = $this->service->validateTime('17:30:00', 'out');

        $this->assertSame('On-time', $result);
    }

    public function test_validate_time_returns_on_time_when_checking_out_exactly_at_end(): void
    {
        // Exactly 17:00 is NOT less than 17:00 → On-time
        $result = $this->service->validateTime('17:00:00', 'out');

        $this->assertSame('On-time', $result);
    }
}
