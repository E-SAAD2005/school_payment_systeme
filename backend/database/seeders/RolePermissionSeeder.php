<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view students',
            'create students',
            'edit students',
            'delete students',

            'view payments',
            'create payments',
            'edit payments',
            'delete payments',

            'view users',
            'create users',
            'edit users',
            'delete users',
        ];

        $guards = ['sanctum', 'web'];

        foreach ($guards as $guard) {
            foreach ($permissions as $permission) {
                Permission::firstOrCreate([
                    'name' => $permission,
                    'guard_name' => $guard
                ]);
            }

            $admin     = Role::firstOrCreate(['name' => 'admin',     'guard_name' => $guard]);
            $comptable = Role::firstOrCreate(['name' => 'comptable', 'guard_name' => $guard]);
            $agent     = Role::firstOrCreate(['name' => 'agent',     'guard_name' => $guard]);

            $admin->givePermissionTo(Permission::where('guard_name', $guard)->get());

            $comptable->givePermissionTo([
                'view students',
                'view payments',
                'create payments',
                'edit payments',
            ]);

            $agent->givePermissionTo([
                'view students',
                'create students',
                'edit students',
            ]);
        }
    }
}
