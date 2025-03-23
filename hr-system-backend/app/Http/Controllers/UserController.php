<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
class UserController extends Controller
{

     public function updateUserBasicInfo(Request $request){
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->first_name = $request["first_name"] ?$request['first_name'] : $user->first_name;
        $user->last_name = $request["last_name"] ?$request['last_name'] : $user->last_name;
        $user->date_of_birth = $request["date_of_birth"] ?$request['date_of_birth'] : $user->date_of_birth;
        $user->nationality = $request["nationality"] ?$request['nationality'] : $user->nationality;
        $user->phone_number = $request["phone_number"] ?$request['phone_number'] : $user->phone_number;
        $user->address = $request["address"] ?$request['address'] : $user->address;
        $user->position = $request["position"] ?$request['position'] : $user->position;

        $user->save();

        return response()->json([
            'message' => 'User data updated successfully.',
            'user' => $user
        ]);
    }
    public function updateJobDetails(Request $request){
        $user = Auth::user();
        $jobDetails = $user->userJobDetail;
        $jobDetails->title = $request["title"] ?$request['title'] : $jobDetails->title;
          $jobDetails->employment_type = $request["employment_type"] ?$request['employment_type'] : $jobDetails->employment_type;
          $jobDetails->employment_status = $request["employment_status"] ?$request['employment_status'] : $jobDetails->employment_status;
          $jobDetails->employee_level = $request["employee_level"] ?$request['employee_level'] : $jobDetails->employee_level;
          $jobDetails->work_location = $request["work_location"] ?$request['work_location'] : $jobDetails->work_location;
          $jobDetails->hiring_date = $request["hiring_date"] ?$request['hiring_date'] : $jobDetails->hiring_date;
          $jobDetails->save();
          return response()->
          json([
              "success"=>true,
              "message"=> "updated succesfully",
              "jobs"=> $jobDetails,
          ]);
    }
    public function getUserJobDetails(){
        $user = Auth::user();
        $jobDetails = $user->userJobDetail;
        // if($request->has('update') && $request->input('update') === "update"){
        //   $jobDetails->title = $request["title"] ?$request['title'] : $jobDetails->title;
        //   $jobDetails->employment_type = $request["employment_type"] ?$request['employment_type'] : $jobDetails->employment_type;
        //   $jobDetails->employment_status = $request["employment_status"] ?$request['employment_status'] : $jobDetails->employment_status;
        //   $jobDetails->employee_level = $request["employee_level"] ?$request['employee_level'] : $jobDetails->employee_level;
        //   $jobDetails->work_location = $request["work_location"] ?$request['work_location'] : $jobDetails->work_location;
        //   $jobDetails->hiring_date = $request["hiring_date"] ?$request['hiring_date'] : $jobDetails->hiring_date;
        //   $jobDetails->save();
        //   return response()->
        //   json([
        //       "success"=>true,
        //       "message"=> "updated succesfully",
        //       "jobs"=> $jobDetails,
        //   ]);
        // }

        // check for the user job details if exist
        if(!$jobDetails){
            return response()->
            json([
                "success"=>false,
                "message"=> "failed to load details"
            ]);
        }
        //return oob details  data of the user
        return response()->
            json([
                "success"=>true,
                "jobdetails"=> $jobDetails
            ]);

    }

    public function uploadProfilePhoto(Request $request){

    $request->validate([
        'image' => 'required|string',
    ]);

    // Decode Base64 string
    $image = $request->input('image');
    $image = str_replace('data:image/png;base64,', '', $image);
    $image = str_replace('data:image/jpeg;base64,', '', $image);
    $image = str_replace(' ', '+', $image);
    $imageData = base64_decode($image);

    $fileName = 'profile_' . time() . '.png';

    // Store in storage/app/public/profile_photos/
    Storage::disk('public')->put('profile_photos/' . $fileName, $imageData);

    /** @var \App\Models\User $user */
    $user = Auth::user();
    if ($user) {
        $user->profile_url = 'profile_photos/' . $fileName;
        $user->save();
    }

    return response()->json([
        'status' => true,
        'message' => 'Profile photo uploaded successfully!',
        'photo_url' => url('storage/profile_photos/' . $fileName)
    ]);
   }

}
