<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Comptable',
            'email' => 'comptable@test.com',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Agent',
            'email' => 'agent@test.com',
            'password' => Hash::make('password'),
        ]);
    }
}
