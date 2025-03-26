<?php

namespace App\Observers;

use App\Models\BaseSalary;
use App\Models\Insurance;
use App\Models\Payroll;

class InsuranceObserver
{
    /**
     * Handle the Insurance "created" event.
     */
    public function created(Insurance $insurance): void
    {
        //
    }

    /**
     * Handle the Insurance "updated" event.
     */
    public function updated(Insurance $insurance): void{
        $payroll = Payroll::all();
        foreach($payroll as $p){
            $p->total = $p->total +$insurance->old_cost - $insurance->cost;
            $p->save();
        }

    }

    /**
     * Handle the Insurance "deleted" event.
     */
    public function deleted(Insurance $insurance): void
    {
        //
    }

    /**
     * Handle the Insurance "restored" event.
     */
    public function restored(Insurance $insurance): void
    {
        //
    }

    /**
     * Handle the Insurance "force deleted" event.
     */
    public function forceDeleted(Insurance $insurance): void
    {
        //
    }
}
