<?php

namespace App\Models;

<<<<<<< HEAD
use Illuminate\Database\Eloquent\Factories\HasFactory;
=======
>>>>>>> origin/task3-payments
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
<<<<<<< HEAD
    use HasFactory;
}
=======
    protected $fillable = [
        'student_id',
        'fee_id',
        'amount_paid',
        'payment_method',
        'reference',
        'payment_date',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function fee()
    {
        return $this->belongsTo(Fee::class);
    }

    public function receipt()
    {
        return $this->hasOne(Receipt::class);
    }
}
>>>>>>> origin/task3-payments
