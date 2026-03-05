<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fee extends Model
{
    protected $fillable = [
        'program_id',
        'amount_total',
        'installment_number',
        'due_date',
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}