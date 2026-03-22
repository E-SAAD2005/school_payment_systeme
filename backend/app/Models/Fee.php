<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Fee extends Model
{

    use HasFactory;
    protected $fillable = [
        'program_id',
        'amount_total',
        'installment_number',
        'due_date',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}

