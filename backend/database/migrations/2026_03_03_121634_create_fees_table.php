<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
<<<<<<< HEAD
    /**
     * Run the migrations.
     */
=======
   
>>>>>>> origin/task3-payments
    public function up(): void
    {
        Schema::create('fees', function (Blueprint $table) {
            $table->id();

            $table->foreignId('program_id')
                ->constrained('programs')
                ->onDelete('cascade');
            $table->decimal('amount_total', 10, 2);
<<<<<<< HEAD
            $table->integer('installment_number'); // numéro tranche
=======
            $table->integer('installment_number'); 
>>>>>>> origin/task3-payments
            $table->date('due_date');
            $table->timestamps();
        });
    }

<<<<<<< HEAD
    /**
     * Reverse the migrations.
     */
=======
    
>>>>>>> origin/task3-payments
    public function down(): void
    {
        Schema::dropIfExists('fees');
    }
};
