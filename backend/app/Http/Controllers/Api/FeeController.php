<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Http\Requests\StoreFeeRequest;
use App\Http\Requests\UpdateFeeRequest;

class FeeController extends Controller
{
    public function index()
    {
        return Fee::with('program')->get();
    }

    public function store(StoreFeeRequest $request)
    {
        $fee = Fee::create($request->validated());

        return response()->json($fee, 201);
    }

    public function show(string $id)
    {
        return Fee::findOrFail($id);
    }

    public function update(UpdateFeeRequest $request, string $id)
    {
        $fee = Fee::findOrFail($id);

        $fee->update($request->validated());

        return response()->json($fee);
    }

    public function destroy(string $id)
    {
        Fee::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Tarif supprimé'
        ]);
    }
}
