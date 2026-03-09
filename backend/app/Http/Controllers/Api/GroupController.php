<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;

class GroupController extends Controller
{
    public function index()
    {
        return Group::with('program')->get();
    }

    public function store(StoreGroupRequest $request)
    {
        $group = Group::create($request->validated());

        return response()->json($group, 201);
    }

    public function show(string $id)
    {
        return Group::findOrFail($id);
    }

    public function update(UpdateGroupRequest $request, string $id)
    {
        $group = Group::findOrFail($id);

        $group->update($request->validated());

        return response()->json($group);
    }

    public function destroy(string $id)
    {
        Group::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Groupe supprimé'
        ]);
    }
}
