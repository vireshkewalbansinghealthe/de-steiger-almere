import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'De Steiger Almere <noreply@desteigeralmere.nl>';
const ADMIN_EMAIL = process.env.EMAIL_ADMIN || 'info@desteigeralmere.nl';

// ─── Contract PDF generator (server-side, pdfkit) ────────────────────────────
export async function generateContractPdf(reservation: any, property: any): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const unitTypeLabel = property.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';
    const koopprijs = property.sale_price
      ? `€ ${property.sale_price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '[bedrag]';

    const now = new Date();
    const fmtDate = (d: Date) =>
      d.toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' });
    const startDatum = fmtDate(now);
    const eindDatum = fmtDate(new Date(now.getTime() + 8 * 7 * 24 * 60 * 60 * 1000));

    const gegadigdeNaam = `${reservation.customer_first_name} ${reservation.customer_last_name}`;
    const gegadigdeAdres = `${reservation.customer_address || ''}, ${reservation.customer_postal_code || ''} ${reservation.customer_city || ''}`.trim();
    const gegadigdeContact = `${reservation.customer_email} | ${reservation.customer_phone || ''}`;
    const gegadigdeBedrijf = reservation.customer_company || '';

    // Header
    doc.fontSize(16).font('Helvetica-Bold')
      .text(`RESERVERINGSOVEREENKOMST ${unitTypeLabel.toUpperCase()}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke();
    doc.moveDown(1);

    // Parties
    doc.fontSize(11).font('Helvetica-Bold').text('De ondergetekenden:');
    doc.moveDown(0.5);
    doc.font('Helvetica')
      .text('De Steiger B.V.')
      .text('De Steiger 74-77, 1317 AZ Almere')
      .text('info@desteigeralmere.nl | 0578-769056')
      .text('hierna te noemen: "Verkoper";');
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('EN');
    doc.moveDown(0.5);
    doc.font('Helvetica')
      .text(gegadigdeNaam);
    if (gegadigdeBedrijf) doc.text(gegadigdeBedrijf);
    doc.text(gegadigdeAdres)
      .text(gegadigdeContact)
      .text('hierna te noemen: "Gegadigde";');
    doc.moveDown(0.5);
    doc.text('Hierna gezamenlijk aangeduid als "Partijen" of ieder afzonderlijk als "Partij".');

    doc.moveDown(1);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke();
    doc.moveDown(0.5);

    // Articles
    const article = (title: string, lines: string[]) => {
      doc.font('Helvetica-Bold').fontSize(11).text(title);
      doc.moveDown(0.3);
      lines.forEach(l => {
        doc.font('Helvetica').fontSize(10).text(l, { align: 'justify' });
        doc.moveDown(0.3);
      });
      doc.moveDown(0.5);
    };

    article('ARTIKEL 1 - RESERVERING EN RESERVERINGSPERIODE', [
      `1.1 De Verkoper reserveert de ${unitTypeLabel.toLowerCase()} met nummer ${property.unit_number} gedurende acht (8) weken vanaf ${startDatum} tot ${eindDatum} voor Gegadigde.`,
      `1.2 Uiterlijk vóór ${eindDatum} zal de Gegadigde schriftelijk meedelen of hij tot aankoop wenst over te gaan.`,
      `1.3 Indien de Verkoper niet tijdig bericht heeft ontvangen, vervalt het recht op aankoop van rechtswege.`,
    ]);

    article('ARTIKEL 2 - RESERVERINGSVERGOEDING', [
      `2.1 De Gegadigde is een reserveringsvergoeding verschuldigd van € 1.500,00, welke uiterlijk binnen 48 uur na factuurdatum voldaan dient te zijn.`,
      `2.2 De koopprijs van de Unit bedraagt ${koopprijs}. De Reserveringsvergoeding wordt in mindering gebracht op de koopprijs bij aankoop.`,
      `2.3 Bij niet-tijdige betaling is Gegadigde per direct in verzuim en heeft Verkoper het recht de Overeenkomst te ontbinden.`,
      `2.4 Annulering binnen 48 uur: slechts 25% van de Reserveringsvergoeding verschuldigd. Na eerste week: geen recht op terugbetaling.`,
      `2.5 Indien de aankoop geen doorgang vindt door faillissement Verkoper of intrekking vergunningen, zal de Reserveringsvergoeding volledig worden terugbetaald.`,
    ]);

    article('ARTIKEL 3 - EINDE VAN DE OVEREENKOMST', [
      '3.1 Deze Overeenkomst eindigt door: (a) faillissement, (b) niet-tijdige betaling Reserveringsvergoeding, (c) verstrijken Reserveringsperiode, (d) aankoop van de Unit.',
      '3.2 In geval van beëindiging op grond van art. 3.1 sub a-c heeft Gegadigde geen recht op terugbetaling.',
      '3.3 Bij aankoop (art. 3.1 sub d) wordt de Reserveringsvergoeding in mindering gebracht op de koopprijs.',
    ]);

    article('ARTIKEL 4 - ONDERTEKENING KOOPAKTE', [
      '4.1 Indien Gegadigde vóór afloop van de Reserveringsperiode schriftelijk heeft verklaard te willen kopen, verplicht hij zich de Koopakte binnen vijf (5) werkdagen te ondertekenen.',
      '4.2 Indien Gegadigde in gebreke blijft, vervalt de reservering en blijft de volledige Reserveringsvergoeding aan Verkoper verschuldigd.',
    ]);

    article('ARTIKEL 5 - BOETE BIJ NIET-NAKOMING', [
      '5.1 Indien Gegadigde nalaat de KAO te ondertekenen of anderszins zijn verplichtingen niet nakomt, verbeurt hij een direct opeisbare boete ter hoogte van de Reserveringsvergoeding.',
    ]);

    article('ARTIKEL 6 - BEPERKING AANSPRAKELIJKHEID VERKOPER', [
      '6.1 De Overeenkomst geeft Gegadigde geen recht op schadevergoeding of compensatie voor gemaakte kosten, tenzij uitdrukkelijk schriftelijk anders overeengekomen.',
    ]);

    article('ARTIKEL 7 - GEEN GARANTIES', [
      '7.1 Verkoper geeft geen garantie over bestemming, vergunningen en/of staat van de Unit, tenzij uitdrukkelijk schriftelijk anders overeengekomen in de KAO.',
    ]);

    article('ARTIKEL 8 - SLOTBEPALINGEN', [
      '8.1 Deze Overeenkomst levert voor Gegadigde slechts strikt persoonlijke rechten op en kan niet worden overgedragen zonder voorafgaande schriftelijke toestemming van Verkoper.',
      '8.2 Deze Overeenkomst wordt beheerst door Nederlands recht.',
      '8.3 Alle geschillen worden voorgelegd aan de bevoegde rechter te Midden-Nederland.',
    ]);

    // Signature section
    doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(11).text('ONDERTEKENING');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text('Aldus overeengekomen en in tweevoud ondertekend:');
    doc.moveDown(1);

    doc.font('Helvetica-Bold').text('Verkoper: De Steiger B.V.');
    doc.font('Helvetica').text('Datum: ' + startDatum);
    doc.moveDown(1.5);

    doc.font('Helvetica-Bold').text(`Gegadigde: ${gegadigdeNaam}`);
    if (gegadigdeBedrijf) doc.font('Helvetica').text(gegadigdeBedrijf);
    doc.font('Helvetica').text('Datum: ' + startDatum);
    doc.moveDown(0.5);

    // Embed signature image if available
    if (reservation.signature_data && reservation.signature_data.startsWith('data:image/')) {
      try {
        const base64Data = reservation.signature_data.split(',')[1];
        const imgBuffer = Buffer.from(base64Data, 'base64');
        doc.text('Digitale handtekening:');
        doc.moveDown(0.3);
        doc.image(imgBuffer, { width: 200, height: 80 });
      } catch {
        doc.text('Digitale handtekening: [zie systeemregistratie]');
      }
    }

    doc.end();
  });
}

// ─── HTML email templates ─────────────────────────────────────────────────────
function baseLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin:0; padding:0; background:#f4f4f5; font-family: Arial, sans-serif; }
  .wrapper { max-width:600px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
  .header { background:#1e293b; padding:28px 32px; text-align:center; }
  .header img { height:40px; }
  .header h1 { color:#f59e0b; margin:12px 0 0; font-size:22px; }
  .body { padding:32px; color:#374151; line-height:1.6; }
  .body h2 { color:#1e293b; margin-top:0; }
  .highlight { background:#fef3c7; border-left:4px solid #f59e0b; padding:14px 18px; border-radius:6px; margin:20px 0; }
  .grid { display:table; width:100%; border-collapse:collapse; margin:20px 0; }
  .grid-row { display:table-row; }
  .grid-cell { display:table-cell; padding:10px 14px; border:1px solid #e5e7eb; font-size:14px; }
  .grid-cell.label { background:#f9fafb; font-weight:bold; width:45%; color:#6b7280; }
  .footer { background:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 32px; text-align:center; font-size:12px; color:#9ca3af; }
  .btn { display:inline-block; background:#f59e0b; color:#1e293b!important; text-decoration:none; font-weight:bold; padding:12px 28px; border-radius:8px; margin:16px 0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>De Steiger Almere</h1>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    De Steiger B.V. · De Steiger 74-77, 1317 AZ Almere<br>
    info@desteigeralmere.nl · 0578-769056<br><br>
    <a href="https://www.desteigeralmere.nl">www.desteigeralmere.nl</a>
  </div>
</div>
</body>
</html>`;
}

// ─── 1. Contact form ──────────────────────────────────────────────────────────
export async function sendContactFormEmails(data: {
  name: string;
  email: string;
  interest?: string;
  message?: string;
  formType?: string;
}) {
  const { name, email, interest, message, formType } = data;

  // Confirmation to visitor
  const visitorHtml = baseLayout(`
    <h2>Bedankt voor uw bericht, ${name}!</h2>
    <p>We hebben uw aanvraag goed ontvangen en nemen binnen <strong>24 uur</strong> contact met u op.</p>
    ${interest ? `<div class="highlight"><strong>Interesse in:</strong> ${interest}</div>` : ''}
    ${message ? `<div class="highlight"><strong>Uw bericht:</strong><br>${message.replace(/\n/g, '<br>')}</div>` : ''}
    <p>Met vriendelijke groet,<br><strong>Team De Steiger Almere</strong></p>
  `);

  // Notification to admin
  const adminHtml = baseLayout(`
    <h2>Nieuw contactformulier bericht</h2>
    <div class="grid">
      <div class="grid-row"><div class="grid-cell label">Naam</div><div class="grid-cell">${name}</div></div>
      <div class="grid-row"><div class="grid-cell label">E-mail</div><div class="grid-cell"><a href="mailto:${email}">${email}</a></div></div>
      ${interest ? `<div class="grid-row"><div class="grid-cell label">Interesse</div><div class="grid-cell">${interest}</div></div>` : ''}
      ${formType ? `<div class="grid-row"><div class="grid-cell label">Formuliertype</div><div class="grid-cell">${formType}</div></div>` : ''}
    </div>
    ${message ? `<div class="highlight"><strong>Bericht:</strong><br>${message.replace(/\n/g, '<br>')}</div>` : ''}
    <a href="mailto:${email}" class="btn">Direct beantwoorden</a>
  `);

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Bedankt voor uw bericht – De Steiger Almere',
      html: visitorHtml,
    }),
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `Nieuw contactbericht van ${name}`,
      html: adminHtml,
    }),
  ]);
}

// ─── 2. Reservation confirmation ──────────────────────────────────────────────
export async function sendReservationConfirmationEmails(reservation: any, property: any) {
  const unitTypeLabel = property.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox';
  const customerName = `${reservation.customer_first_name} ${reservation.customer_last_name}`;
  const koopprijs = property.sale_price
    ? `€ ${property.sale_price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '–';
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' });
  const now = new Date();
  const eindDatum = fmtDate(new Date(now.getTime() + 8 * 7 * 24 * 60 * 60 * 1000));

  // Generate contract PDF
  const pdfBuffer = await generateContractPdf(reservation, property);

  const fileName = `Reserveringsovereenkomst-${unitTypeLabel}-${property.unit_number}.pdf`;

  // Customer email
  const customerHtml = baseLayout(`
    <h2>Uw reservering is bevestigd!</h2>
    <p>Geachte ${customerName},</p>
    <p>Hartelijk dank voor uw reservering bij De Steiger Almere. Uw reservering is succesvol verwerkt en de aanbetaling ontvangen.</p>
    <div class="highlight">
      <strong>Reserveringsnummer:</strong> ${reservation.reservation_number}<br>
      <strong>Unit:</strong> ${unitTypeLabel} ${property.unit_number}<br>
      <strong>Koopprijs:</strong> ${koopprijs}<br>
      <strong>Reserveringskosten:</strong> € 1.500,00 (verrekend bij aankoop)<br>
      <strong>Reserveringsperiode:</strong> tot ${eindDatum}
    </div>
    <p>In de bijlage vindt u de <strong>ondertekende reserveringsovereenkomst</strong> als PDF.</p>
    <p>Binnen <strong>8 weken</strong> dient u schriftelijk te laten weten of u tot aankoop wenst over te gaan.</p>
    <p>Heeft u vragen? Neem dan contact met ons op:</p>
    <p>
      📧 <a href="mailto:info@desteigeralmere.nl">info@desteigeralmere.nl</a><br>
      📞 0578-769056
    </p>
    <p>Met vriendelijke groet,<br><strong>Team De Steiger Almere</strong></p>
  `);

  // Admin notification email
  const adminHtml = baseLayout(`
    <h2>🎉 Nieuwe reservering ontvangen!</h2>
    <div class="grid">
      <div class="grid-row"><div class="grid-cell label">Reserveringsnummer</div><div class="grid-cell">${reservation.reservation_number}</div></div>
      <div class="grid-row"><div class="grid-cell label">Klant</div><div class="grid-cell">${customerName}</div></div>
      <div class="grid-row"><div class="grid-cell label">E-mail</div><div class="grid-cell"><a href="mailto:${reservation.customer_email}">${reservation.customer_email}</a></div></div>
      <div class="grid-row"><div class="grid-cell label">Telefoon</div><div class="grid-cell">${reservation.customer_phone || '–'}</div></div>
      ${reservation.customer_company ? `<div class="grid-row"><div class="grid-cell label">Bedrijf</div><div class="grid-cell">${reservation.customer_company}</div></div>` : ''}
      <div class="grid-row"><div class="grid-cell label">Unit</div><div class="grid-cell">${unitTypeLabel} ${property.unit_number}</div></div>
      <div class="grid-row"><div class="grid-cell label">Koopprijs</div><div class="grid-cell">${koopprijs}</div></div>
      <div class="grid-row"><div class="grid-cell label">Reserveringsperiode</div><div class="grid-cell">t/m ${eindDatum}</div></div>
    </div>
    <a href="mailto:${reservation.customer_email}" class="btn">Contact opnemen met klant</a>
  `);

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: reservation.customer_email,
      subject: `Reserveringsbevestiging ${unitTypeLabel} ${property.unit_number} – De Steiger Almere`,
      html: customerHtml,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
        },
      ],
    }),
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `Nieuwe reservering: ${unitTypeLabel} ${property.unit_number} – ${customerName}`,
      html: adminHtml,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
        },
      ],
    }),
  ]);
}
