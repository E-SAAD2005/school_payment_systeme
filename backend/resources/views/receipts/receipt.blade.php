<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt</title>

    <style>
        body{
            font-family: Arial;
        }

        .container{
            width:100%;
            padding:20px;
        }

        h1{
            text-align:center;
        }

        table{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
        }

        table, th, td{
            border:1px solid black;
        }

        th, td{
            padding:10px;
            text-align:left;
        }

    </style>
</head>

<body>

<div class="container">

<h1>Payment Receipt</h1>

<p><strong>Receipt Number:</strong> {{ $receiptNumber }}</p>
<p><strong>Student:</strong> {{ $student->id }}</p>

<table>
<tr>
<th>Installment</th>
<th>Total Fee</th>
<th>Paid Now</th>
<th>Total Paid</th>
<th>Remaining</th>
</tr>

<tr>
<td>{{ $fee->installment_number }}</td>
<td>{{ $amountTotal }}</td>
<td>{{ $payment->amount_paid }}</td>
<td>{{ $totalPaid }}</td>
<td>{{ $reste }}</td>
</tr>
</table>

<p style="margin-top:20px">
Payment Method: {{ $payment->payment_method }}
</p>

<p>
Date: {{ $payment->payment_date }}
</p>

</div>

</body>
</html>