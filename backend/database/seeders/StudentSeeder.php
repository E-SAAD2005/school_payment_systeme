<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\Program;
use App\Models\Group;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $program = Program::first();
        $group = Group::where('program_id', $program->id)->first();

        if ($program && $group) {
            Student::create([
                'first_name' => 'Ahmed',
                'last_name' => 'ISSAM',
                'cne' => 'G123456789',
                'email' => 'ahmed@example.com',
                'phone' => '0600000000',
                'program_id' => $program->id,
                'group_id' => $group->id,
                'status' => 'actif',
            ]);

            Student::create([
                'first_name' => 'Sanaa',
                'last_name' => 'BENANI',
                'cne' => 'G987654321',
                'email' => 'sanaa@example.com',
                'phone' => '0611111111',
                'program_id' => $program->id,
                'group_id' => $group->id,
                'status' => 'actif',
            ]);
        }
    }
}
