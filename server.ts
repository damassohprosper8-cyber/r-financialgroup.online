import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Database persistence directory & file
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'loans_requests.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed if file does not exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Helper to read all loan requests
function getLoansRequests(): any[] {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading loans_requests.json:', err);
    return [];
  }
}

// Helper to save all loan requests
function saveLoansRequests(records: any[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving loans_requests.json:', err);
  }
}

// Nodemailer transporter initialization (lazy)
let mailTransporter: Transporter | null = null;
function getTransporter(): Transporter | null {
  if (mailTransporter) return mailTransporter;

  const host = process.env.SMTP_HOST || 'mail.privateemail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || 'contact@r-financialgroup.online';
  const pass = process.env.SMTP_PASS || 'Prosper25@';

  if (host && user && pass) {
    mailTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return mailTransporter;
}

// ==========================================
// API ROUTES FIRST
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET /api/loans-requests - Retrieve all loan applications
app.get('/api/loans-requests', (req, res) => {
  const records = getLoansRequests();
  res.json({ success: true, count: records.length, data: records });
});

// DELETE /api/loans-requests - Delete all loan applications permanently
app.delete('/api/loans-requests', (req, res) => {
  saveLoansRequests([]);
  res.json({ success: true, message: 'Toutes les demandes ont été supprimées avec succès' });
});

// DELETE /api/loans-requests/:reference - Delete single record by reference
app.delete('/api/loans-requests/:reference', (req, res) => {
  const { reference } = req.params;
  const records = getLoansRequests();
  const filtered = records.filter((r) => r.reference !== reference);
  saveLoansRequests(filtered);
  res.json({ success: true, deleted: reference, count: filtered.length });
});

// POST /api/loans-requests - Systematic DB save & Alert Email Trigger
app.post('/api/loans-requests', async (req, res) => {
  try {
    const payload = req.body;

    const firstName = (payload.firstName || '').trim();
    const lastName = (payload.lastName || '').trim();
    const email = (payload.email || '').trim().toLowerCase();
    const phoneCountryCode = (payload.phoneCountryCode || '+33').trim();
    const phone = (payload.phone || '').trim();
    const country = (payload.country || 'France').trim();
    const professionalSituation = (payload.professionalSituation || 'Salarié').trim();
    const monthlyIncome = Number(payload.monthlyIncome) || 0;
    const monthlyExpenses = Number(payload.monthlyExpenses) || 0;
    const amount = Number(payload.amount) || 25000;
    const months = Number(payload.months) || 48;
    const project = payload.project || 'auto';
    const withInsurance = Boolean(payload.withInsurance);
    const taeg = Number(payload.taeg) || 2.0;
    const monthlyPayment = Number(payload.monthlyPayment) || 0;

    // 1. Calculations: Debt Ratio (%) and Remaining Income (€)
    // Taux d'endettement = ((Charges + Mensualité) / Revenus) * 100
    const totalOutflow = monthlyExpenses + monthlyPayment;
    const debtRatio = monthlyIncome > 0
      ? Number(((totalOutflow / monthlyIncome) * 100).toFixed(2))
      : 0;

    // Reste à vivre = Revenus - (Charges + Mensualité)
    const remainingIncome = Number((monthlyIncome - totalOutflow).toFixed(2));

    // 2. Generate unique reference: PR-2026-XXXX
    const year = 2026;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refDossier = `PR-${year}-${randomSuffix}`;
    const createdAtIso = new Date().toISOString();
    const createdAtFormatted = new Date().toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    const fullRecord = {
      id: `req-${Date.now()}-${randomSuffix}`,
      reference: refDossier,
      created_at: createdAtIso,
      created_at_formatted: createdAtFormatted,
      updated_at: createdAtIso,

      // 1. Projet de financement
      project,
      amount,
      months,
      withInsurance,
      taeg,
      monthlyPayment,
      totalCost: payload.totalCost || 0,
      totalDue: payload.totalDue || (amount + (payload.totalCost || 0)),

      // 2. Informations du prospect
      firstName,
      lastName,
      email,
      phoneCountryCode,
      phone,
      fullPhone: `${phoneCountryCode} ${phone}`.trim(),
      country,

      // 3. Situation financière & calculs
      professionalSituation,
      monthlyIncome,
      monthlyExpenses,
      debtRatio,
      remainingIncome,

      // Status
      status: 'PENDING',
      emailAlertStatus: 'PENDING',
      history: [
        {
          id: `hist-${Date.now()}`,
          status: 'PENDING',
          changedAt: createdAtIso,
          changedBy: 'Système (Formulaire Web)',
          comment: 'Demande enregistrée en BDD (loans_requests)',
        },
      ],
    };

    // 1. Sauvegarde systématique en BDD (loans_requests) avant toute tentative d'envoi d'e-mail
    const existing = getLoansRequests();
    existing.unshift(fullRecord);
    saveLoansRequests(existing);

    // 2. Configuration de l'E-mail d'alerte (Entrant)
    const companyToEmail = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'r-financialgroup@outlook.fr';
    const systemFromEmail = process.env.SMTP_FROM || 'contact@r-financialgroup.online';
    const prospectEmail = email; // [IMPORTANT] Reply-To must be prospect email

    const emailSubject = `[NOUVELLE DEMANDE] Réf: ${refDossier} - ${firstName} ${lastName} (${amount} €)`;

    // 3. Modèle de contenu de l'e-mail (Structure HTML fidèle au PDF)
    const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${emailSubject}</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 22px 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 18px; letter-spacing: 1px; font-weight: bold; text-transform: uppercase;">
        NOUVELLE DEMANDE DE PRÊT REÇUE
      </h1>
    </div>

    <div style="padding: 24px;">
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 6px; font-size: 14px;">
          <strong>Référence Dossier :</strong> <span style="font-family: monospace; font-weight: bold; color: #1d4ed8; font-size: 16px;">${refDossier}</span>
        </p>
        <p style="margin: 0; font-size: 14px; color: #475569;">
          <strong>Date &amp; Heure :</strong> ${createdAtFormatted}
        </p>
      </div>

      <div style="margin-bottom: 22px;">
        <h3 style="margin: 0 0 10px; font-size: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">
          1. PROJET DE FINANCEMENT
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 45%;">- Montant demandé :</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${amount.toLocaleString('fr-FR')} €</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">- Durée souhaitée :</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${months} mois</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">- Mensualité estimée :</td>
            <td style="padding: 6px 0; font-weight: bold; color: #2563eb;">${monthlyPayment.toFixed(2)} € / mois</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 22px;">
        <h3 style="margin: 0 0 10px; font-size: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">
          2. INFORMATIONS DU PROSPECT
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 45%;">- Nom &amp; Prénom :</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">- E-mail :</td>
            <td style="padding: 6px 0; font-weight: bold; color: #2563eb;">
              <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">- Téléphone :</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${phoneCountryCode} ${phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">- Pays de résidence :</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${country}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px; font-size: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">
          3. SITUATION FINANCIÈRE &amp; CALCULS
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 45%;">- Situation pro :</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${professionalSituation}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">- Revenus mensuels :</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${monthlyIncome.toLocaleString('fr-FR')} €</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">- Charges mensuelles :</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${monthlyExpenses.toLocaleString('fr-FR')} €</td>
          </tr>
        </table>

        <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-top: 14px; border-radius: 4px;">
          <p style="margin: 0 0 6px; font-size: 12px; font-weight: bold; color: #475569; letter-spacing: 0.5px;">
            [INDICATEURS AUTO-CALCULÉS]
          </p>
          <p style="margin: 0 0 4px; font-size: 14px; color: #0f172a;">
            - Taux d'endettement : <strong>${debtRatio} %</strong>
          </p>
          <p style="margin: 0; font-size: 14px; color: #0f172a;">
            - Reste à vivre : <strong>${remainingIncome.toLocaleString('fr-FR')} €</strong>
          </p>
        </div>
      </div>
    </div>

    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; font-size: 12px; color: #64748b; text-align: center;">
      <p style="margin: 0 0 4px;">
        ✉️ <em>Cet e-mail est configuré avec un Reply-To pointant directement sur : <strong>${email}</strong></em>
      </p>
      <p style="margin: 0;">
        Cliquez sur « Répondre » pour envoyer un e-mail directement au client.
      </p>
    </div>
  </div>
</body>
</html>
`;

    const emailText = `
NOUVELLE DEMANDE DE PRÊT REÇUE
---
Référence Dossier : ${refDossier}
Date & Heure : ${createdAtFormatted}

1. PROJET DE FINANCEMENT
---
- Montant demandé : ${amount} €
- Durée souhaitée : ${months} mois
- Mensualité estimée : ${monthlyPayment.toFixed(2)} € / mois

2. INFORMATIONS DU PROSPECT
---
- Nom & Prénom : ${firstName} ${lastName}
- E-mail : ${email}
- Téléphone : ${phoneCountryCode} ${phone}
- Pays de résidence : ${country}

3. SITUATION FINANCIÈRE & CALCULS
---
- Situation pro : ${professionalSituation}
- Revenus mensuels : ${monthlyIncome} €
- Charges mensuelles : ${monthlyExpenses} €
---
[INDICATEURS AUTO-CALCULÉS]
- Taux d'endettement : ${debtRatio} %
- Reste à vivre : ${remainingIncome} €
---
`;

    let emailSent = false;
    let emailError: string | null = null;

    const transporter = getTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: systemFromEmail,
          to: companyToEmail,
          replyTo: prospectEmail,
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
        });
        emailSent = true;
      } catch (err: any) {
        console.error('Failed to send email alert via SMTP:', err);
        emailError = err.message || 'SMTP delivery failed';
      }
    } else {
      // In dev environment without SMTP configured, log alert email
      console.log('--- [SIMULATED EMAIL ALERT SENT] ---');
      console.log(`To: ${companyToEmail}`);
      console.log(`From: ${systemFromEmail}`);
      console.log(`Reply-To: ${prospectEmail}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(emailText);
      console.log('------------------------------------');
      emailSent = true; // Logged / queued successfully
    }

    // Update record email status in DB
    fullRecord.emailAlertStatus = emailSent ? 'SENT' : 'FAILED';
    if (emailError) {
      (fullRecord as any).emailAlertError = emailError;
    }
    saveLoansRequests(existing);

    // Return response with unique reference for front-end redirection
    return res.status(201).json({
      success: true,
      reference: refDossier,
      created_at: createdAtIso,
      data: fullRecord,
      emailSent,
    });
  } catch (error: any) {
    console.error('Error handling loans_requests submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde de la demande',
      error: error.message,
    });
  }
});

// Update status endpoint (Back-Office)
app.patch('/api/loans-requests/:reference', (req, res) => {
  const { reference } = req.params;
  const { status, comment, adminUser = 'admin_rfinancial' } = req.body;

  const records = getLoansRequests();
  const index = records.findIndex((r) => r.reference === reference);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Dossier introuvable' });
  }

  const now = new Date().toISOString();
  records[index].status = status || records[index].status;
  records[index].updated_at = now;
  if (!records[index].history) records[index].history = [];
  records[index].history.unshift({
    id: `hist-${Date.now()}`,
    status: records[index].status,
    changedAt: now,
    changedBy: adminUser,
    comment,
  });

  saveLoansRequests(records);
  res.json({ success: true, data: records[index] });
});

// ==========================================
// VITE MIDDLEWARE (Development & Production)
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
