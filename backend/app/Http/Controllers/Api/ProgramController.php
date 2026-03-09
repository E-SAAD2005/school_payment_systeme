<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Http\Requests\StoreProgramRequest;
use App\Http\Requests\UpdateProgramRequest;

class ProgramController extends Controller
{
    public function index()
    {
        return Program::all();
    }

    public function store(StoreProgramRequest $request)
    {
        $program = Program::create($request->validated());

        return response()->json($program, 201);
    }

    public function show(string $id)
    {
        return Program::findOrFail($id);
    }

    public function update(UpdateProgramRequest $request, string $id)
    {
        $program = Program::findOrFail($id);

        $program->update($request->validated());

        return response()->json($program);
    }

    public function destroy(string $id)
    {
        Program::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Programme supprimé'
        ]);
    }
}
