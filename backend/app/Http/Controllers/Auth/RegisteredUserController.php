<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
<<<<<<< HEAD
   public function store(Request $request)
=======
    public function store(Request $request): Response
>>>>>>> origin/task3-payments
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
<<<<<<< HEAD
            'password' => Hash::make($request->password),

            // مؤقتاً فقط إذا مازال باغي تحتافظ بالكولون القديمة
            // والأفضل لاحقاً تحيدها/تبدل اسمها
            'role' => 'agent',
        ]);

        $user->syncRoles(['agent']);

        event(new Registered($user));

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Register success',
            'token' => $token,
            'user' => $user->load('roles', 'permissions'),
        ], 201);
=======
            'password' => Hash::make($request->string('password')),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return response()->noContent();
>>>>>>> origin/task3-payments
    }
}
