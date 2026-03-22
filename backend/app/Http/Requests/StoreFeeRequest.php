<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id' => 'required|exists:programs,id',
            'amount_total' => 'required|numeric',
            'installment_number' => 'required|integer|min:1',
            'due_date' => 'required|date'
        ];
    }
}
