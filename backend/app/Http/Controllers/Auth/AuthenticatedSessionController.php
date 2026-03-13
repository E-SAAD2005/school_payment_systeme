<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
<<<<<<< HEAD
    public function store(LoginRequest $request)
    {
        $request->authenticate();

        $user = $request->user();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login success',
            'token' => $token,
            'user' => $user->load('roles', 'permissions'),
        ]);
    }


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
=======
    public function store(LoginRequest $request): Response
    {
        $request->authenticate();

        $request->session()->regenerate();

        return response()->noContent();
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
>>>>>>> origin/task3-payments
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

<<<<<<< HEAD
        //return response()->noContent();
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout success',
        ]);
=======
        return response()->noContent();
>>>>>>> origin/task3-payments
    }
}
