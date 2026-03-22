<?php

namespace Database\Seeders;

use App\Models\Fee;
use App\Models\Program;
use Illuminate\Database\Seeder;

class FeeSeeder extends Seeder
{
    public function run(): void
    {
        $programs = Program::all();

        if ($programs->isEmpty()) {
            $programs = collect([
                Program::create(['name' => 'Génie Informatique']),
                Program::create(['name' => 'Gestion des Entreprises']),
            ]);
        }

        foreach ($programs as $program) {
            // Tranche 1
            Fee::create([
                'program_id' => $program->id,
                'amount_total' => 5000,
                'installment_number' => 1,
                'due_date' => now()->addDays(30),
            ]);

            // Tranche 2
            Fee::create([
                'program_id' => $program->id,
                'amount_total' => 5000,
                'installment_number' => 2,
                'due_date' => now()->addMonths(3),
            ]);
        }
    }
}
