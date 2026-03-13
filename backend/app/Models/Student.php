<?php

namespace App\Models;

<<<<<<< HEAD
use Illuminate\Database\Eloquent\Factories\HasFactory;
=======
>>>>>>> origin/task3-payments
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
<<<<<<< HEAD
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'cne',
        'email',
        'phone',
        'program_id',
        'group_id',
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
    public function payments()
{
    return $this->hasMany(Payment::class);
}
}
>>>>>>> origin/task3-payments
