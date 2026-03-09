<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id' => 'required|exists:programs,id',
            'amount' => 'required|numeric',
            'due_date' => 'required|date',
            'period' => 'required|string|max:100'
        ];
    }
}
