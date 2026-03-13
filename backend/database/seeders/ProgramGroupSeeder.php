<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProgramGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    \App\Models\Program::insert([
        ['name' => 'Informatique'],
        ['name' => 'Comptabilité'],
        ['name' => 'Marketing'],
    ]);

    // Récupère les IDs après insertion
    $info = \App\Models\Program::where('name', 'Informatique')->first()->id;
    $compta = \App\Models\Program::where('name', 'Comptabilité')->first()->id;
    $market = \App\Models\Program::where('name', 'Marketing')->first()->id;

    \App\Models\Group::insert([
        ['name' => 'Groupe A', 'program_id' => $info],
        ['name' => 'Groupe B', 'program_id' => $compta],
        ['name' => 'Groupe C', 'program_id' => $market],
    ]);
    \App\Models\Group::insert([
    ['name' => 'Groupe A', 'program_id' => $info,   'academic_year' => '2024-2025'],
    ['name' => 'Groupe B', 'program_id' => $compta, 'academic_year' => '2024-2025'],
    ['name' => 'Groupe C', 'program_id' => $market, 'academic_year' => '2024-2025'],
]);
}
}
