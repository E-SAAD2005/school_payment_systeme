<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;


use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{

    use HasFactory;
        protected $fillable = [
        'receipt_number',
        'payment_id',
        'issue_date',
        'pdf_path',
        'receipt_type',
    ];
        public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }



    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

}
