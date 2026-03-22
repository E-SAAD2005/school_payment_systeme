<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Historique des Paiements</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        .header { width: 100%; border-bottom: 2px solid #1E3A8A; padding-bottom: 10px; margin-bottom: 20px; }
        .logo { width: 80px; }
        .title { font-size: 18px; font-weight: bold; color: #1E3A8A; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #1E3A8A; color: white; padding: 8px; text-align: left; }
        td { border-bottom: 1px solid #ddd; padding: 8px; }
        .total { margin-top: 20px; text-align: right; font-size: 14px; font-weight: bold; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #777; }
    </style>
</head>
<body>
    <div class="header">
        <table style="border:none;">
            <tr style="border:none;">
                <td style="border:none; width: 20%;">
                    @if($logo) <img src="{{ $logo }}" class="logo"> @endif
                </td>
                <td style="border:none; width: 60%;" class="title">
                    HISTORIQUE DES PAIEMENTS
                </td>
                <td style="border:none; width: 20%; text-align: right;">
                    Fès, le {{ $date }}
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Étudiant</th>
                <th>Programme</th>
                <th>Groupe</th>
                <th>Mode</th>
                <th>N° Reçu</th>
                <th>Montant</th>
            </tr>
        </thead>
        <tbody>
            @foreach($payments as $p)
            <tr>
                <td>{{ $p->payment_date }}</td>
                <td>{{ $p->student->first_name }} {{ $p->student->last_name }}</td>
                <td>{{ $p->student->program->name ?? 'N/A' }}</td>
                <td>{{ $p->student->group->name ?? 'N/A' }}</td>
                <td>{{ ucfirst($p->payment_method) }}</td>
                <td>{{ $p->receipt->receipt_number ?? 'N/A' }}</td>
                <td style="font-weight: bold;">{{ number_format($p->amount_paid, 2) }} MAD</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total">
        TOTAL ENCAISSÉ : {{ number_format($total, 2) }} MAD
    </div>

    <div class="footer">
        Ecole Polytechnique des Génies - Document généré automatiquement
    </div>
</body>
</html>