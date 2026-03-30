<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HolidaySeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('holidays')->count() > 0) {
            return;
        }

        $now = now();

        $holidays = [
            // ── Public Holidays (Lebanon) — recurring ─────────────────
            [
                'name'         => "New Year's Day",
                'date'         => '2026-01-01',
                'type'         => 'public',
                'is_recurring' => true,
                'description'  => 'Celebration of the new year.',
            ],
            [
                'name'         => 'Armenian Christmas',
                'date'         => '2026-01-06',
                'type'         => 'public',
                'is_recurring' => true,
                'description'  => 'Armenian Orthodox Christmas Day.',
            ],
            [
                'name'         => "Saint Maroun's Day",
                'date'         => '2026-02-09',
                'type'         => 'public',
                'is_recurring' => true,
                'description'  => 'National holiday commemorating Saint Maroun, patron of the Maronite Church.',
            ],
            [
                'name'         => 'Labor Day',
                'date'         => '2026-05-01',
                'type'         => 'public',
                'is_recurring' => true,
                'description'  => 'International Workers Day.',
            ],
            [
                'name'         => 'Martyrs Day',
                'date'         => '2026-05-06',
                'type'         => 'public',
                'is_recurring' => true,
                'description'  => 'Commemorates Lebanese and Syrian martyrs executed by the Ottomans in 1916.',
            ],
            [
                'name'         => 'Assumption of Mary',
                'date'         => '2026-08-15',
                'type'         => 'public',
                'is_recurring' => true,
                'description'  => 'Catholic and Orthodox feast of the Assumption of the Virgin Mary.',
            ],
            [
                'name'         => 'All Saints Day',
                'date'         => '2026-11-01',
                'type'         => 'public',
                'is_recurring' => true,
                'description'  => 'Christian holiday honoring all saints.',
            ],
            [
                'name'         => 'Independence Day',
                'date'         => '2026-11-22',
                'type'         => 'public',
                'is_recurring' => true,
                'description'  => 'Lebanese Independence Day, commemorating the end of the French Mandate in 1943.',
            ],
            [
                'name'         => 'Christmas Day',
                'date'         => '2026-12-25',
                'type'         => 'public',
                'is_recurring' => true,
                'description'  => 'Christian holiday celebrating the birth of Jesus Christ.',
            ],
            // ── Non-recurring Public Holidays (variable dates) ─────────
            [
                'name'         => 'Good Friday',
                'date'         => '2026-04-03',
                'type'         => 'public',
                'is_recurring' => false,
                'description'  => 'Christian observance of the crucifixion of Jesus. Date varies each year.',
            ],
            [
                'name'         => 'Easter Monday',
                'date'         => '2026-04-06',
                'type'         => 'public',
                'is_recurring' => false,
                'description'  => 'Day after Easter Sunday. Date varies each year.',
            ],
            [
                'name'         => 'Eid al-Fitr',
                'date'         => '2026-03-20',
                'type'         => 'public',
                'is_recurring' => false,
                'description'  => 'Islamic holiday marking the end of Ramadan. Date varies by lunar calendar.',
            ],
            [
                'name'         => 'Eid al-Adha',
                'date'         => '2026-05-27',
                'type'         => 'public',
                'is_recurring' => false,
                'description'  => 'Islamic Festival of Sacrifice. Date varies by lunar calendar.',
            ],
            [
                'name'         => 'Islamic New Year',
                'date'         => '2026-07-17',
                'type'         => 'public',
                'is_recurring' => false,
                'description'  => 'Islamic New Year (1 Muharram). Date varies by lunar calendar.',
            ],
            [
                'name'         => "Prophet's Birthday (Mawlid)",
                'date'         => '2026-09-25',
                'type'         => 'public',
                'is_recurring' => false,
                'description'  => "Celebration of the Prophet Muhammad's birthday. Date varies by lunar calendar.",
            ],
            // ── Company Holidays ───────────────────────────────────────
            [
                'name'         => 'Company Foundation Day',
                'date'         => '2026-02-14',
                'type'         => 'company',
                'is_recurring' => true,
                'description'  => 'Annual celebration of the company\'s founding. All employees receive a half-day off in the afternoon.',
            ],
            [
                'name'         => 'Summer Recess — Day 1',
                'date'         => '2026-08-03',
                'type'         => 'company',
                'is_recurring' => false,
                'description'  => 'First day of the annual summer recess (Aug 3–7, 2026). Office is closed.',
            ],
            [
                'name'         => 'Summer Recess — Day 2',
                'date'         => '2026-08-04',
                'type'         => 'company',
                'is_recurring' => false,
                'description'  => 'Second day of the annual summer recess.',
            ],
            [
                'name'         => 'Summer Recess — Day 3',
                'date'         => '2026-08-05',
                'type'         => 'company',
                'is_recurring' => false,
                'description'  => 'Third day of the annual summer recess.',
            ],
            [
                'name'         => 'End-of-Year Party Day',
                'date'         => '2026-12-31',
                'type'         => 'company',
                'is_recurring' => true,
                'description'  => 'Company end-of-year celebration. Office closes at noon; annual awards ceremony in the afternoon.',
            ],
        ];

        foreach ($holidays as $holiday) {
            DB::table('holidays')->insert(array_merge($holiday, [
                'created_at' => $now,
                'updated_at' => $now,
            ]));
        }
    }
}
