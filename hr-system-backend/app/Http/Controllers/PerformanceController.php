<?php

namespace App\Http\Controllers;

use App\Models\PerformanceType;
use App\Models\TeamPerformance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class PerformanceController extends Controller
{
   public function rateTeam(Request $request){

    $user = Auth::user();

    $typeArray = $request['type_ids'];
    $rateArray = $request['rate'];
    $teamrateArray = [];
    $counter = 0;
    foreach($typeArray as $type){
        $teamperfo = new TeamPerformance();
        $teamperfo->user_id = $user->id;
        $teamperfo->type_id = $type;
        $teamperfo->rate = $rateArray[$counter++];
        $teamperfo->comment = $request['comment'];
        $teamperfo->save();
        $teamrateArray [] =$teamperfo;
        if(!$teamperfo){
            return response()->json([
                'success' => false,
                'message' => $teamperfo
            ]);
        }
    }

    return response()->json([
        'success' => true,
        'rates' => $teamrateArray
    ]);

   }
   public function getLastTeamRate(){
    $user = Auth::user();
    $latestRates = TeamPerformance::where('user_id', $user->id)
    ->orderBy('type_id')
    ->orderByDesc('created_at')
    ->get()
    ->unique('type_id')
    ->sortBy('type_id');
    return response()->json([
        'success' => true,
        'latest_ratings' => $latestRates->values()
    ]);
   }

   public function getTypes(){
        $types = PerformanceType::all();

        return response()->json([
            'success' => true,
            'types' => $types
        ]);
   }
}
