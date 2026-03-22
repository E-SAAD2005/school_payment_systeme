<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate([
            'email' => 'admin@test.com',
        ], [
            'name' => 'Admin',
            'password' => Hash::make('password'),
        ]);
        $admin->syncRoles(['admin']);

        $comptable = User::firstOrCreate([
            'email' => 'comptable@test.com',
        ], [
            'name' => 'Comptable',
            'password' => Hash::make('password'),
        ]);
        $comptable->syncRoles(['comptable']);

        $agent = User::firstOrCreate([
            'email' => 'agent@test.com',
        ], [
            'name' => 'Agent',
            'password' => Hash::make('password'),
        ]);
        $agent->syncRoles(['agent']);
    }
}
