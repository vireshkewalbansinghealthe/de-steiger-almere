import { NextRequest, NextResponse } from 'next/server';
import * as docusign from 'docusign-esign';
import jwt from 'jsonwebtoken';

const DOCUSIGN_CONFIG = {
  clientId: process.env.DOCUSIGN_CLIENT_ID || '',
  clientSecret: process.env.DOCUSIGN_CLIENT_SECRET || '',
  accountId: process.env.DOCUSIGN_ACCOUNT_ID || '',
  userId: process.env.DOCUSIGN_USER_ID || '',
  baseUrl: process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi',
  authServer: process.env.DOCUSIGN_AUTH_SERVER || 'https://account-d.docusign.com',
  redirectUri: process.env.DOCUSIGN_REDIRECT_URI || ''
};

// JWT authentication scopes
const SCOPES = 'signature impersonation';

interface ContractData {
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  selectedUnits: Array<{
    id: string;
    unitNumber: number;
    name: string;
    price: string;
    area: number;
  }>;
  totalPrice: number;
  reservationFee: number;
}

export async function POST(request: NextRequest) {
  try {
    const contractData: ContractData = await request.json();
    
    // Validate required data
    if (!contractData.customerInfo?.email || !contractData.selectedUnits?.length) {
      return NextResponse.json(
        { error: 'Ontbrekende contractgegevens' },
        { status: 400 }
      );
    }

    // Validate DocuSign configuration
    if (!DOCUSIGN_CONFIG.clientId || !DOCUSIGN_CONFIG.accountId || !DOCUSIGN_CONFIG.userId) {
      return NextResponse.json(
        { error: 'DocuSign configuratie ontbreekt' },
        { status: 500 }
      );
    }

    // Generate contract document content
    const contractContent = generateContractContent(contractData);
    
    // Get DocuSign access token using JWT
    const accessToken = await getDocuSignJWTToken();
    
    // Initialize DocuSign API client
    const dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(DOCUSIGN_CONFIG.baseUrl);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
    
    // Create envelope definition
    const envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.emailSubject = `Koopcontract De Steiger - ${contractData.selectedUnits.length} unit(s)`;
    envelopeDefinition.status = 'sent';
    
    // Create document
    const document = new docusign.Document();
    document.documentBase64 = Buffer.from(contractContent).toString('base64');
    document.name = 'Koopcontract De Steiger';
    document.fileExtension = 'html';
    document.documentId = '1';
    
    envelopeDefinition.documents = [document];
    
    // Create signer
    const signer = new docusign.Signer();
    signer.email = contractData.customerInfo.email;
    signer.name = `${contractData.customerInfo.firstName} ${contractData.customerInfo.lastName}`;
    signer.recipientId = '1';
    signer.routingOrder = '1';
    
    // Create signature tab
    const signHere = new docusign.SignHere();
    signHere.documentId = '1';
    signHere.pageNumber = '3';
    signHere.recipientId = '1';
    signHere.tabLabel = 'SignHereTab';
    signHere.xPosition = '200';
    signHere.yPosition = '700';
    
    // Create date tab
    const dateTab = new docusign.DateSigned();
    dateTab.documentId = '1';
    dateTab.pageNumber = '3';
    dateTab.recipientId = '1';
    dateTab.xPosition = '200';
    dateTab.yPosition = '750';
    
    // Add tabs to signer
    const tabs = new docusign.Tabs();
    tabs.signHereTabs = [signHere];
    tabs.dateSignedTabs = [dateTab];
    signer.tabs = tabs;
    
    // Create recipients
    const recipients = new docusign.Recipients();
    recipients.signers = [signer];
    envelopeDefinition.recipients = recipients;
    
    // Create envelope
    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    const envelopeResult = await envelopesApi.createEnvelope(DOCUSIGN_CONFIG.accountId, {
      envelopeDefinition: envelopeDefinition
    });
    
    if (!envelopeResult.envelopeId) {
      throw new Error('Envelope creation failed');
    }
    
    // Get signing URL
    const recipientView = new docusign.RecipientViewRequest();
    recipientView.authenticationMethod = 'none';
    recipientView.email = contractData.customerInfo.email;
    recipientView.userName = `${contractData.customerInfo.firstName} ${contractData.customerInfo.lastName}`;
    recipientView.clientUserId = '1';
    recipientView.returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/contract/completed`;
    
    const viewResult = await envelopesApi.createRecipientView(
      DOCUSIGN_CONFIG.accountId,
      envelopeResult.envelopeId,
      { recipientViewRequest: recipientView }
    );
    
    // Store contract information in database
    // TODO: Save to Supabase with envelope ID for tracking
    
    return NextResponse.json({
      success: true,
      envelopeId: envelopeResult.envelopeId,
      signingUrl: viewResult.url,
      message: 'Contract verzonden voor ondertekening'
    });

  } catch (error) {
    console.error('DocuSign integration error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het voorbereiden van het contract' },
      { status: 500 }
    );
  }
}

// Handle DocuSign webhook callbacks
export async function PUT(request: NextRequest) {
  try {
    const webhookData = await request.json();
    
    // Verify webhook authenticity (in production)
    // TODO: Implement webhook signature verification
    
    const { envelopeId, status, recipients } = webhookData;
    
    if (status === 'completed') {
      // Contract has been signed
      // TODO: Update reservation status in database
      // TODO: Send confirmation email to customer
      // TODO: Notify sales team
      
      console.log(`Contract ${envelopeId} has been signed by all parties`);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('DocuSign webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function generateContractContent(data: ContractData): string {
  const currentDate = new Date().toLocaleDateString('nl-NL');
  
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Koopovereenkomst De Steiger</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1e293b; padding-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1e293b; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .unit-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .unit-table th, .unit-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        .unit-table th { background-color: #f3f4f6; font-weight: bold; }
        .signature-area { margin-top: 100px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; }
        .signature-line { border-bottom: 1px solid #000; margin-bottom: 10px; height: 50px; }
        .date-line { border-bottom: 1px solid #000; width: 150px; display: inline-block; }
        .total-price { font-size: 18px; font-weight: bold; color: #059669; }
        .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>KOOPOVEREENKOMST DE STEIGER</h1>
        <p><strong>Datum:</strong> ${currentDate}</p>
    </div>

    <div class="section">
        <h2>PARTIJEN</h2>
        <div style="display: flex; justify-content: space-between;">
            <div style="width: 48%;">
                <h3>Verkoper:</h3>
                <p>
                    <strong>De Steiger B.V.</strong><br>
                    Gevestigd te Almere<br>
                    KvK nummer: [KvK_NUMMER]<br>
                    BTW nummer: [BTW_NUMMER]
                </p>
            </div>
            <div style="width: 48%;">
                <h3>Koper:</h3>
                <p>
                    <strong>${data.customerInfo.firstName} ${data.customerInfo.lastName}</strong><br>
                    ${data.customerInfo.address}<br>
                    ${data.customerInfo.postalCode} ${data.customerInfo.city}<br>
                    ${data.customerInfo.country}<br>
                    <br>
                    E-mail: ${data.customerInfo.email}<br>
                    Telefoon: ${data.customerInfo.phone}
                    ${data.customerInfo.company ? `<br>Bedrijf: ${data.customerInfo.company}` : ''}
                </p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>ARTIKEL 1 - VERKOCHTE OBJECTEN</h2>
        <p>Hierbij wordt verkocht:</p>
        <table class="unit-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Unit Nummer</th>
                    <th>Oppervlakte</th>
                    <th>Koopprijs</th>
                </tr>
            </thead>
            <tbody>
                ${data.selectedUnits.map((unit, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${unit.name}</td>
                        <td>${unit.unitNumber}</td>
                        <td>${unit.area}m²</td>
                        <td><strong>${unit.price}</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>ARTIKEL 2 - KOOPPRIJS EN BETALING</h2>
        <p class="total-price">Totale koopprijs: €${data.totalPrice.toLocaleString('nl-NL')}</p>
        
        <h3>Betalingsschema:</h3>
        <ul>
            <li><strong>Reserveringskosten:</strong> €${data.reservationFee.toLocaleString('nl-NL')} (binnen 24 uur na ondertekening)</li>
            <li><strong>Resterende bedrag:</strong> €${(data.totalPrice - data.reservationFee).toLocaleString('nl-NL')} (binnen 3 maanden via notaris)</li>
        </ul>
    </div>

    <div class="section">
        <h2>ARTIKEL 3 - RESERVERINGSPERIODE</h2>
        <div class="warning">
            <ul>
                <li>De reservering is geldig voor <strong>4 weken</strong> na betaling van de reserveringskosten</li>
                <li>Indien de volledige koopsom niet binnen <strong>3 maanden</strong> wordt voldaan, vervalt de reservering</li>
                <li>Bij verval van de reservering worden de reserveringskosten <strong>niet gerestitueerd</strong></li>
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>ARTIKEL 4 - LEVERING</h2>
        <p>Levering van het object vindt plaats na:</p>
        <ul>
            <li>Volledige betaling van de koopsom</li>
            <li>Notariële overdracht</li>
            <li>Oplevering conform overeengekomen specificaties</li>
        </ul>
    </div>

    <div class="section">
        <h2>ARTIKEL 5 - GARANTIES EN AANSPRAKELIJKHEID</h2>
        <p>De verkoper staat in voor de overeengekomen kwaliteit en specificaties zoals vermeld in de verkoopbrochure.</p>
    </div>

    <div class="section">
        <h2>ARTIKEL 6 - ALGEMENE VOORWAARDEN</h2>
        <p>Op deze overeenkomst zijn de algemene voorwaarden van De Steiger B.V. van toepassing.</p>
    </div>

    <div class="section">
        <h2>ARTIKEL 7 - TOEPASSELIJK RECHT</h2>
        <p>Op deze overeenkomst is Nederlands recht van toepassing.</p>
    </div>

    <div style="page-break-before: always;">
        <h2>ONDERTEKENING</h2>
        <p>Door ondertekening verklaren partijen akkoord te gaan met alle bovenstaande voorwaarden.</p>
        
        <div class="signature-area">
            <div class="signature-box">
                <h3>Verkoper: De Steiger B.V.</h3>
                <div class="signature-line"></div>
                <p>Handtekening</p>
                <p>Datum: <span class="date-line"></span></p>
            </div>
            
            <div class="signature-box">
                <h3>Koper: ${data.customerInfo.firstName} ${data.customerInfo.lastName}</h3>
                <div class="signature-line"></div>
                <p>Handtekening</p>
                <p>Datum: <span class="date-line"></span></p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// JWT Token generation for DocuSign authentication
async function getDocuSignJWTToken(): Promise<string> {
  try {
    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: DOCUSIGN_CONFIG.clientId,
      sub: DOCUSIGN_CONFIG.userId,
      aud: DOCUSIGN_CONFIG.authServer,
      iat: now,
      exp: now + 3600, // 1 hour expiration
      scope: SCOPES
    };

    // You'll need to create an RSA private key for JWT signing
    // For now, we'll use the client secret (not recommended for production)
    const token = jwt.sign(payload, DOCUSIGN_CONFIG.clientSecret, { algorithm: 'HS256' });

    // Exchange JWT for access token
    const tokenResponse = await fetch(`${DOCUSIGN_CONFIG.authServer}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('DocuSign token error:', errorText);
      throw new Error(`Token request failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;

  } catch (error) {
    console.error('JWT token generation failed:', error);
    throw new Error('Failed to authenticate with DocuSign');
  }
}
