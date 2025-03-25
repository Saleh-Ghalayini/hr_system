<?php

namespace App\Observers;

use App\Models\LeaveBalance;
use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        $leaveBalance = new LeaveBalance();
        $leaveBalance->user_id = $user->id;
        $leaveBalance->balances = [
            'annual' => 15,
            'sick' => 15,
            'casual' => 15,
            'other' => 15,
        ];
        $leaveBalance->save();
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        //
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
