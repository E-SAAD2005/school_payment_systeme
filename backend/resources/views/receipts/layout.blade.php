<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">

    <style>
        @page {
            margin: 0;
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 60px;
            position: relative;
        }

        /* 🔵 TOP BAR */
        .top-bar {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 80px;
            background: linear-gradient(to right, #2ea3d8, #0d6efd);
        }

        /* 🔵 BOTTOM BAR */
        .bottom-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 80px;
            background: linear-gradient(to right, #2ea3d8, #0d6efd);
        }

        /* 🔥 WATERMARK */
        .watermark {
            position: fixed;
            top: 30%;
            left: 0;
            width: 100%;
            text-align: center;
            opacity: 0.06;
            z-index: -1;
        }

        .watermark img {
            width: 500px;
        }

        .header {
            margin-top: 20px;
        }

        .header-left {
            float: left;
            width: 60%;
        }

        .header-right {
            float: right;
            width: 35%;
            text-align: right;
        }

        .school-name {
            font-weight: bold;
            font-size: 14px;
        }

        .school-address {
            font-size: 11px;
        }

        .logo {
            width: 90px;
        }

        .clear {
            clear: both;
        }

        .title-container {
            text-align: center;
            margin: 40px 0;
        }

        .title-box {
            border: 2px solid #2ea3d8;
            padding: 10px 60px;
            font-size: 18px;
            font-weight: bold;
            display: inline-block;
        }

        .date-line {
            text-align: right;
            margin-bottom: 40px;
            font-size: 14px;
        }

        .content {
            margin-top: 20px;
            font-size: 14px;
        }

        .row {
            margin-bottom: 18px;
        }

        .label {
            font-weight: bold;
        }

        .line {
            display: inline-block;
            border-bottom: 1px dotted black;
            width: 350px;
            margin-left: 5px;
        }

        .signature {
            text-align: right;
            margin-top: 50px;
            font-weight: bold;
        }

        .footer {
            position: absolute;
            bottom: 30px;
            width: 100%;
            text-align: center;
            font-size: 10px;
        }

        .footer-bold {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 5px;
        }
    </style>
</head>

<body>

    <!-- 🔵 BARS -->
    <div class="top-bar"></div>
    <div class="bottom-bar"></div>

    <!-- 🔥 WATERMARK -->
    <div class="watermark">
        <img src="{{ public_path('assets/logo1.png') }}">
    </div>

    <!-- HEADER -->
    <div class="header">
        <div class="header-left">
            <div class="school-name">Ecole Polytechnique des Génies</div>
            <div class="school-address">
                22, Rue Mohamed El Hayani, V.N Fès,<br>
                4ème Etage Imm Hazzaz APP 20
            </div>
        </div>

        <div class="header-right">
            <img src="{{ public_path('assets/logo1.png') }}" class="logo">
            <div style="font-size: 9px; font-weight: bold; margin-top: 5px;">
                Ecole Polytechnique Des Génies
            </div>
        </div>

        <div class="clear"></div>
    </div>

    <!-- TITLE -->
    <div class="title-container">
        <div class="title-box">
            @yield('title')
        </div>
    </div>

    <!-- DATE -->
    <div class="date-line">
        Fès, Le :
        <span class="line" style="width: 250px;"></span>
    </div>

    <!-- CONTENT -->
    <div class="content">

        <div class="row">
            <span class="label">Reçu N° :</span>
            <span>{{ $receiptNumber }}</span>
        </div>

        <div class="row">
            <span class="label">CIN/Passeport N° :</span>
            <span>{{ $student->cne }}</span>
            <span class="line"></span>
        </div>

        <div class="row">
            <span class="label">Nom :</span>
            <span>{{ $student->last_name }}</span>
            <span class="line"></span>
        </div>

        <div class="row">
            <span class="label">Prénom :</span>
            <span>{{ $student->first_name }}</span>
            <span class="line"></span>
        </div>

        @yield('additional_fields')

        <div class="row">
            <span class="label">Montant :</span>
            <span style="font-weight: bold;">
                {{ number_format($payment->amount_paid, 2) }} MAD
            </span>
            <span class="line"></span>
        </div>

    </div>

    <!-- SIGNATURE -->
    <div class="signature">
        La Direction
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <div class="footer-bold">
            Veuillez conserver précieusement votre reçu comme preuve de paiement.
        </div>
        <div>
            Adresse : 22, Rue Mohamed El Hayani, V.N Fès, 4ème Etage Imm Hazzaz
        </div>
        <div>
            Tél : (+212) 06 60 77 73 82 / 06 19 08 66 66
        </div>
        <div>
            Email : contact@epg.ma | Site web : www.epg.ma
        </div>
    </div>

</body>
</html>