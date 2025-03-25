<?php

namespace App\Http\Controllers;

use App\Models\Insurance;
use Illuminate\Http\Request;

class InsuranceController extends Controller
{
    public function getInsurances(){
        return Insurance::all();
    }

    public function updatePlan(Request $request){
        $new_value = $request["value"];
        $insurance_type = $request["type"];
        $insurance = Insurance::where('type', $insurance_type)->first();
        $insurance->cost = $new_value;
        $insurance->save();

        return response()->json([
            "success" => true,
            "message" => "updated successfully",
        ]);
    }
}
