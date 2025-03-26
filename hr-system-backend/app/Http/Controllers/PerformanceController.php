<?php

namespace App\Http\Controllers;
use Carbon\Carbon;
use App\Models\EmployeePerformance;
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

   public function rateEmployee(Request $request){
    $user_id= $request['user_id'];
    $manager=Auth::user();
    $typeArray = $request['type_ids'];
    $rateArray = $request['rate'];
    $EmployeerateArray = [];
    $counter = 0;
    foreach($typeArray as $type){
        $Employeeperfo = new EmployeePerformance();
        $Employeeperfo->user_id = $user_id;
        $Employeeperfo->manager_id = $manager->id;
        $Employeeperfo->type_id = $type;
        $Employeeperfo->rate = $rateArray[$counter++];
        $Employeeperfo->comment = $request['comment'];
        $Employeeperfo->create_at = now();
        $Employeeperfo->save();
        $EmployeerateArray [] =$Employeeperfo;
        if(!$Employeeperfo){
            return response()->json([
                'success' => false,
                'message' => $Employeeperfo
            ]);
        }
   }
   return response()->json([
    'success' => true,
    'rates' => $EmployeerateArray
]);
}
 public function getEmployeRate(Request $request){

    $request['user_id'] ?

        $user_id  = $request['user_id']
    :
        $user_id = Auth::user()->id;



    $latestRatings = EmployeePerformance::where('user_id',$user_id)
        ->orderBy('type_id')
        ->orderByDesc('created_at')
        ->get()
        ->unique('type_id')
        ->sortBy('type_id')
        ->values();

    $ratesArray = $latestRatings->pluck('rate')->toArray();
    $comment = $latestRatings->first()->comment ?? null;

    return response()->json([
        'success' => true,
        'rates' => $ratesArray,
        'comment' => $comment
    ]);
 }
    public function getAverageRate(){
        $Employeesrating =  EmployeePerformance::selectRaw('type_id, AVG(rate) as average_rate')
        ->whereYear('created_at', Carbon::now()->year) 
        ->groupBy('type_id')
        ->orderBy('type_id')
        ->get();
        return response()->json([
            'success' => true,
            'average_ratings' => $Employeesrating
        ]);
    }


}
