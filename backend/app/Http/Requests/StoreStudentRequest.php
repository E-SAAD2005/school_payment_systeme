<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'cne' => 'required|string|max:50|unique:students,cne',
            'email' => 'nullable|email|unique:students,email',
            'phone' => 'nullable|string|max:20',
            'program_id' => 'required|exists:programs,id',
            'group_id' => 'required|exists:groups,id',
            'status' => ['required', Rule::in(['actif', 'suspendu'])],
        ];
    }
}
