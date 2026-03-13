<?php

namespace App\Models;

<<<<<<< HEAD
use Illuminate\Database\Eloquent\Factories\HasFactory;
=======
>>>>>>> origin/task3-payments
use Illuminate\Database\Eloquent\Model;

class Fee extends Model
{
<<<<<<< HEAD
    use HasFactory;
    protected $fillable = [
        'student_id',
        'amount',
        'status',
        'due_date'
    ];
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}

=======
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
>>>>>>> origin/task3-payments
