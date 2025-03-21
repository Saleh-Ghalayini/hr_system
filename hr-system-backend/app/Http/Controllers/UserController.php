<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
class UserController extends Controller
{

    public function getUserJobDetails(){
        $user = Auth::user();
        $jobDetails = $user->userJobDetail;
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

    public function uploadProfilePhoto(Request $request)
{
    // Validate the request
    $request->validate([
        'image' => 'required|string', // Expecting a Base64 string
    ]);

    // Decode Base64 string
    $image = $request->input('image');
    $image = str_replace('data:image/png;base64,', '', $image);
    $image = str_replace('data:image/jpeg;base64,', '', $image);
    $image = str_replace(' ', '+', $image);
    $imageData = base64_decode($image);

    // Generate a unique filename
    $fileName = 'profile_' . time() . '.png';

    // Store in storage/app/public/profile_photos/
    Storage::disk('public')->put('profile_photos/' . $fileName, $imageData);

    // Save the file path to the database
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
