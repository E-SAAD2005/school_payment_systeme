<?php

namespace App\Models;

<<<<<<< HEAD
use Illuminate\Database\Eloquent\Factories\HasFactory;
=======
>>>>>>> origin/task3-payments
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
<<<<<<< HEAD
    use HasFactory;
     protected $fillable = [
        'name',
        'program_id',
        'academic_year'
    ];
     public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }
=======
    //
>>>>>>> origin/task3-payments
}
