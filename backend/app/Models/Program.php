<?php

namespace App\Models;

<<<<<<< HEAD
use Illuminate\Database\Eloquent\Factories\HasFactory;
=======
>>>>>>> origin/task3-payments
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
<<<<<<< HEAD
    use HasFactory;
    protected $fillable = [
        'name',
        'description'
    ];
     public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function groups()
    {
        return $this->hasMany(Group::class);
    }

    public function fees()
    {
        return $this->hasMany(Fee::class);
    }
=======
    //
>>>>>>> origin/task3-payments
}
