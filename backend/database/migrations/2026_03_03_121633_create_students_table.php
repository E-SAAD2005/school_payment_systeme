<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
      Schema::create('students', function (Blueprint $table) {
        $table->id();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('cne')->unique();
        $table->string('email')->nullable();
        $table->string('phone')->nullable();
        $table->foreignId('program_id')
            ->constrained('programs')
            ->onDelete('cascade');
        $table->foreignId('group_id')
            ->constrained('groups')
            ->onDelete('cascade');
        $table->enum('status', ['actif', 'suspendu'])
            ->default('actif');
        $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
