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

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'sanctum'  // ✅
            ]);
        }

        $admin     = Role::firstOrCreate(['name' => 'admin',     'guard_name' => 'sanctum']);  // ✅
        $comptable = Role::firstOrCreate(['name' => 'comptable', 'guard_name' => 'sanctum']);  // ✅
        $agent     = Role::firstOrCreate(['name' => 'agent',     'guard_name' => 'sanctum']);  // ✅

        $admin->givePermissionTo(Permission::where('guard_name', 'sanctum')->get());  // ✅

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
