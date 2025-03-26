<?php

namespace App\Observers;

use App\Models\BaseSalary;
use App\Models\Insurance;
use App\Models\LeaveBalance;
use App\Models\User;
use App\Models\Payroll;
use App\Models\Tax;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {

        $payroll = new Payroll;
        $payroll->user_id = $user->id;
        $payroll->fullname = $user->first_name . " " . $user->last_name;
        $payroll->base_salary_id = BaseSalary::where('position', $user->position)->value('id');
        $payroll->insurance= Insurance::where('id', $user->insurance_id)->value('type');
        $payroll->extra_leaves = 0;
        $payroll->position = $user->position;
        $payroll->month = date_format($user->created_at, "M");
        $payroll->total = BaseSalary::where('position',$user->position)->value('salary');
                            
        
        $payroll->save();

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
