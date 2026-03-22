<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Program;
use App\Models\Group;

class ProgramGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programs = [
            ['name' => 'Informatique'],
            ['name' => 'Comptabilite'],
            ['name' => 'Marketing'],
        ];

        foreach ($programs as $p) {
            $program = Program::firstOrCreate($p);
            
            Group::firstOrCreate([
                'name' => 'Groupe A',
                'program_id' => $program->id,
                'academic_year' => '2024-2025'
            ]);
        }
    }
}
