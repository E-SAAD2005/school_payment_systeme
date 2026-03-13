<?php

namespace App\Models;

<<<<<<< HEAD
use Illuminate\Database\Eloquent\Factories\HasFactory;
=======
>>>>>>> origin/task3-payments
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
<<<<<<< HEAD
    use HasFactory;
        protected $fillable = [
            'student_id',
            'payment_id',
            'amount',
            'receipt_number',
            'date',
            'status',


        ];
        public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }
}
=======
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
>>>>>>> origin/task3-payments
