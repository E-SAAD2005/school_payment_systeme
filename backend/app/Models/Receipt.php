<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    protected $fillable = [
        'receipt_number',
        'payment_id',
        'issue_date',
        'pdf_path',
        'receipt_type',
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}