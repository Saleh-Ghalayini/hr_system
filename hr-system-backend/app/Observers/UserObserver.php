<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Payroll;
use App\Models\BaseSalary;
use App\Models\LeaveBalance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    public function created(User $user): void
    {
        try {
            DB::transaction(function () use ($user) {
                $baseSalary = BaseSalary::where('position', $user->position)->first();

                Payroll::create([
                    'user_id'        => $user->id,
                    'fullname'       => $user->first_name . ' ' . $user->last_name,
                    'position'       => $user->position,
                    'base_salary_id' => $baseSalary?->id,
                    'insurance_id'   => $user->insurance_id,
                    'extra_leaves'   => 0,
                    'month'          => now()->format('F Y'),
                    'total'          => $baseSalary?->salary ?? 0,
                ]);

                LeaveBalance::create([
                    'user_id'  => $user->id,
                    'balances' => [
                        'annual'  => 15,
                        'sick'    => 15,
                        'casual'  => 10,
                        'other'   => 5,
                    ],
                ]);
            });
        } catch (\Throwable $e) {
            Log::error('UserObserver: failed to create payroll/leave balance for user ' . $user->id, [
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function updated(User $user): void
    {
        // If the user's position changed, update their payroll base salary and total
        if ($user->isDirty('position')) {
            try {
                $baseSalary = BaseSalary::where('position', $user->position)->first();
                $user->payroll?->update([
                    'position'       => $user->position,
                    'base_salary_id' => $baseSalary?->id,
                    'total'          => $baseSalary?->salary ?? 0,
                ]);
            } catch (\Throwable $e) {
                Log::error('UserObserver: failed to update payroll for user ' . $user->id, [
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    public function deleting(User $user): void
    {
        // Cancel all pending leave requests when a user is soft-deleted
        $user->leaveRequests()
            ->where('status', 'pending')
            ->update(['status' => 'rejected']);

        // Terminate active enrollments
        $user->enrollments()
            ->whereIn('status', ['enrolled', 'in_progress'])
            ->update(['status' => 'terminated']);
    }

    public function restored(User $user): void
    {
        //
    }

    public function forceDeleted(User $user): void
    {
        //
    }
}
