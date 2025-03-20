<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    // auth functions
    public function login(Request $request){
        dd("login");
    }
    public function signup(Request $request){
        dd("signup");
    }
 
}
