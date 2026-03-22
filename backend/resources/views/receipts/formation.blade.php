@extends('receipts.layout')

@section('title')
    REÇU FRAIS DE FORMATION
@endsection

@section('additional_fields')
    <div class="row">
        <span class="label">Matière :</span>
        <span>{{ $student->program->name ?? '' }}</span>
        <span class="dotted-line" style="width: 400px;">&nbsp;</span>
    </div>
    <div class="row">
        <span class="label">Séance de :</span>
        <span class="dotted-line" style="width: 150px;">&nbsp;</span>
        <span class="label" style="width: auto; margin-left: 10px;">A :</span>
        <span class="dotted-line" style="width: 150px;">&nbsp;</span>
    </div>
@endsection
