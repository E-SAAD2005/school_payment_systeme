@extends('receipts.layout')

@section('title')
    REÇU D'ASSURANCE
@endsection

@section('additional_fields')
    <div class="row">
        <span class="label">Niveau :</span>
        <span>{{ $student->group->name ?? '' }}</span>
        <span class="dotted-line" style="width: 400px;">&nbsp;</span>
    </div>
    <div class="row">
        <span class="label">Filière :</span>
        <span>{{ $student->program->name ?? '' }}</span>
        <span class="dotted-line" style="width: 400px;">&nbsp;</span>
    </div>
@endsection
