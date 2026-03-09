<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $programId = $this->route('program');

        return [
            'name' => 'required|string|max:150|unique:programs,name,' . $programId,
            'description' => 'nullable|string'
        ];
    }
}
