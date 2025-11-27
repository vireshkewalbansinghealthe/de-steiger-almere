'use client';

import { useState } from 'react';
import { FileText, X, Download, Check, Scroll } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ContractViewProps {
  reservationData: any;
  propertyData: any;
  onClose?: () => void;
  standalone?: boolean;
}

export default function ContractView({ 
  reservationData, 
  propertyData,
  onClose,
  standalone = false 
}: ContractViewProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
    }
  };

  // Contract variables mapping
  const contractVariables = {
    // Verkoper (Seller) info
    verkoperNaam: 'De Steiger B.V.',
    verkoperAdres: 'De Steiger 74-77, 1317 AZ Almere',
    verkoperContact: 'info@desteiger.nl | 036-123 4567',
    
    // Gegadigde (Buyer) info
    gegadigdeNaam: `${reservationData.customerInfo?.firstName || ''} ${reservationData.customerInfo?.lastName || ''}`.trim(),
    gegadigdeAdres: `${reservationData.customerInfo?.address || ''}, ${reservationData.customerInfo?.postalCode || ''} ${reservationData.customerInfo?.city || ''}`.trim(),
    gegadigdeContact: `${reservationData.customerInfo?.email || ''} | ${reservationData.customerInfo?.phone || ''}`,
    gegadigdeBedrijf: reservationData.customerInfo?.company || '',
    
    // Unit info
    unitNummer: propertyData?.unit_number || reservationData.unitNumber || '',
    unitType: propertyData?.type === 'bedrijfsunit' ? 'bedrijfsunit' : 'opslagbox',
    unitTypeLabel: propertyData?.type === 'bedrijfsunit' ? 'Bedrijfsunit' : 'Opslagbox',
    
    // Financial info
    koopprijs: propertyData?.sale_price 
      ? `€ ${propertyData.sale_price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
      : '[bedrag]',
    reserveringsKosten: '€ 1.500,00',
    
    // Date info
    startDatum: format(new Date(), 'dd MMMM yyyy', { locale: nl }),
    eindDatum: format(new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: nl }), // 8 weeks
    deadlineDatum: format(new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: nl }),
    ondertekeningDatum: format(new Date(), 'dd MMMM yyyy', { locale: nl }),
    ondertekeningPlaats: reservationData.customerInfo?.city || 'Almere',
  };

  const fillContractTemplate = () => {
    const template = `RESERVERINGSOVEREENKOMST ${contractVariables.unitTypeLabel.toUpperCase()}

De ondergetekenden:

${contractVariables.verkoperNaam}
${contractVariables.verkoperAdres}
${contractVariables.verkoperContact}
hierna te noemen: "Verkoper";

EN

${contractVariables.gegadigdeNaam}${contractVariables.gegadigdeBedrijf ? `\n${contractVariables.gegadigdeBedrijf}` : ''}
${contractVariables.gegadigdeAdres}
${contractVariables.gegadigdeContact}
hierna te noemen: "Gegadigde";

Hierna gezamenlijk aangeduid als "Partijen" of ieder afzonderlijk als "Partij".

═══════════════════════════════════════════════════════════════════════════

OVERWEGENDE ALS VOLGT:

• De Gegadigde is geïnteresseerd in de reservering van een ${contractVariables.unitTypeLabel.toLowerCase()} van Verkoper;

• Partijen thans de voorwaarden willen vastleggen met betrekking tot de reservering en eventuele aankoop van de ${contractVariables.unitTypeLabel.toLowerCase()};

• Deze overwegingen een integraal onderdeel vormen van de overeenkomst (hierna: "Overeenkomst").

═══════════════════════════════════════════════════════════════════════════

KOMEN HET VOLGENDE OVEREEN:

═══════════════════════════════════════════════════════════════════════════

ARTIKEL 1 - RESERVERING EN RESERVERINGSPERIODE

1.1 De Verkoper reserveert de ${contractVariables.unitTypeLabel.toLowerCase()} met nummer ${contractVariables.unitNummer} (hierna: "Unit") gedurende acht (8) weken vanaf ${contractVariables.startDatum} tot ${contractVariables.eindDatum} (hierna: "Reserveringsperiode") voor Gegadigde.

1.2 Uiterlijk vóór ${contractVariables.deadlineDatum} zal de Gegadigde aan de Verkoper schriftelijk meedelen of hij tot aankoop van de Unit wenst over te gaan.

1.3 Indien de Verkoper niet tijdig voor de einddatum van de Reserveringsperiode van Gegadigde schriftelijk bericht heeft ontvangen of hij de Unit wenst te kopen, vervalt het recht op aankoop van de Unit van rechtswege door het overschrijden van de Reserveringsperiode. De Verkoper is dan volledig vrij om de Unit aan (een) andere gegadigde(n) aan te bieden. De gehele reserveringsvergoeding vervalt dan volledig aan de Verkoper.

═══════════════════════════════════════════════════════════════════════════

ARTIKEL 2 - RESERVERINGSVERGOEDING

2.1 De Gegadigde is een reserveringsvergoeding verschuldigd ter hoogte van ${contractVariables.reserveringsKosten} (hierna: "Reserveringsvergoeding"), welke uiterlijk binnen 48 uur na factuurdatum voldaan dient te zijn aan Verkoper. Hiervoor wordt Gegadigde separaat een factuur gezonden.

2.2 De koopprijs van de Unit bedraagt ${contractVariables.koopprijs}. De Reserveringsvergoeding wordt in mindering gebracht op de koopprijs bij de aankoop van de Unit.

2.3 Indien de Verkoper de Reserveringsvergoeding niet tijdig op haar rekening heeft ontvangen van Gegadigde, is Gegadigde per direct in verzuim en blijft de Gegadigde gehouden om alsnog per direct de Reserveringsvergoeding te voldoen aan Verkoper. Verkoper heeft vanaf de verzuimdatum het recht om de Overeenkomst te ontbinden onverminderd haar overige rechten, waaronder het recht tot aanvullende of vervangende schadevergoeding. De Verkoper is tevens volledig vrij om de Unit aan (een) andere gegadigde(n) aan te bieden per de hiervoor genoemde verzuimdatum.

2.4 Indien de reservering van de Unit wordt geannuleerd binnen de eerste achtenveertig (48) uur van de Reserveringsperiode, is Gegadigde slechts 25% van de Reserveringsvergoeding verschuldigd aan Verkoper. Indien de reservering van de Unit wordt geannuleerd na de eerste week van de Reserveringsperiode, heeft Gegadigde geen recht op terugbetaling van de Reserveringsvergoeding.

2.5 Indien de aankoop van de Unit geen doorgang vindt door faillissement van de Verkoper en/of intrekking van de vereiste vergunningen in het kader van deze Overeenkomst, terwijl de Reserveringsvergoeding al betaald is door de Gegadigde, zal Verkoper de Reserveringsvergoeding volledig terugbetalen aan Gegadigde.

═══════════════════════════════════════════════════════════════════════════

ARTIKEL 3 - EINDE VAN DE OVEREENKOMST

3.1 Deze Overeenkomst eindigt door:

    a) Faillissement of surseance van betaling van Gegadigde en/of Verkoper;
    b) Het niet-tijdig betalen van de Reserveringsvergoeding door Gegadigde, zoals genoemd in artikel 2 lid 1 van deze Overeenkomst;
    c) Het verstrijken van de Reserveringsperiode door Gegadigde, zoals genoemd in artikel 1 lid 1 van deze Overeenkomst;
    d) Aankoop van de Unit door Gegadigde.

3.2 Ingeval van beëindiging van de Overeenkomst op grond van artikel 3.1 sub a-c van deze Overeenkomst, heeft Gegadigde geen recht op terugbetaling van de Reserveringsvergoeding.

3.3 Ingeval van beëindiging van de Overeenkomst op grond van artikel 3.1, sub d van deze Overeenkomst, wordt de Reserveringsvergoeding in mindering gebracht op de koopprijs bij de aankoop van de Unit.

═══════════════════════════════════════════════════════════════════════════

ARTIKEL 4 - ONDERTEKENING KOOPAKTE

4.1 Indien de Gegadigde vóór afloop van de Reserveringsperiode schriftelijk heeft verklaard de Unit te willen kopen, verplicht de Gegadigde zich om binnen vijf (5) werkdagen nadat hij de Verkoper dit schriftelijk heeft medegedeeld, de Koopakte (hierna: "KAO") te ondertekenen.

4.2 Indien de Gegadigde in gebreke blijft om de KAO te ondertekenen binnen de hiervoor genoemde termijn, vervalt de reservering van rechtswege en blijft de volledige Reserveringsvergoeding aan Verkoper verschuldigd. De Verkoper is dan volledig vrij om de Unit aan (een) andere gegadigde(n) aan te bieden.

═══════════════════════════════════════════════════════════════════════════

ARTIKEL 5 - BOETE BIJ NIET-NAKOMING

5.1 Indien de Gegadigde aan de Verkoper schriftelijk heeft verklaard de Unit te willen kopen, maar nalaat om de KAO te ondertekenen of anderszins zijn verplichtingen uit deze Overeenkomst niet nakomt, verbeurt de Gegadigde, zonder nadere ingebrekestelling, een direct opeisbare boete ter hoogte van de Reserveringsvergoeding, onverminderd het recht van Verkoper op aanvullende schadevergoeding.

═══════════════════════════════════════════════════════════════════════════

ARTIKEL 6 - BEPERKING AANSPRAKELIJKHEID VERKOPER

6.1 De Overeenkomst geeft de Gegadigde geen enkel recht op schadevergoeding of compensatie voor gemaakte kosten (zoals advies-, notaris- of financieringskosten), tenzij uitdrukkelijk schriftelijk anders is overeengekomen.

═══════════════════════════════════════════════════════════════════════════

ARTIKEL 7 - GEEN GARANTIES

7.1 De Verkoper geeft geen enkele garantie aan de Gegadigde over de bestemming, vergunningen en/of de staat van de Unit, tenzij uitdrukkelijk schriftelijk anders overeengekomen in de KAO.

═══════════════════════════════════════════════════════════════════════════

ARTIKEL 8 - SLOTBEPALINGEN

8.1 Deze Overeenkomst levert voor Gegadigde slechts strikt persoonlijke rechten en verplichtingen op. Gegadigde kan deze Overeenkomst niet overdragen aan een andere partij zonder voorafgaande schriftelijke toestemming van Verkoper.

8.2 Deze Overeenkomst wordt beheerst door Nederlands recht.

8.3 Alle geschillen, die naar aanleiding van deze Overeenkomst mochten ontstaan, van welke aard en omvang dan ook, daaronder begrepen mede die, welke slechts door een van de Partijen als zodanig worden beschouwd, zullen, nadat minnelijk overleg niet heeft geleid tot een oplossing voor het geschil, worden voorgelegd aan de bevoegde rechter te Midden-Nederland.

═══════════════════════════════════════════════════════════════════════════

ONDERTEKENING

Aldus overeengekomen en in tweevoud ondertekend:

Verkoper:
${contractVariables.verkoperNaam}

Naam: _______________________
Plaats: Almere
Datum: ${contractVariables.ondertekeningDatum}


Gegadigde:
${contractVariables.gegadigdeNaam}${contractVariables.gegadigdeBedrijf ? `\n${contractVariables.gegadigdeBedrijf}` : ''}

Naam: _______________________
Plaats: ${contractVariables.ondertekeningPlaats}
Datum: ${contractVariables.ondertekeningDatum}

Digitale handtekening: [Zie bijlage]`;

    return template;
  };

  const contractText = fillContractTemplate();

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([contractText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Reserveringsovereenkomst-${contractVariables.unitTypeLabel}-${contractVariables.unitNummer}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (standalone) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-yellow-500 mr-3" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Reserveringsovereenkomst
                </h3>
                <p className="text-sm text-gray-600">
                  {contractVariables.unitTypeLabel} {contractVariables.unitNummer}
                </p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>

          <div 
            className="p-8 max-h-[70vh] overflow-y-auto prose prose-sm max-w-none"
            onScroll={handleScroll}
          >
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
              {contractText}
            </pre>
          </div>

          {!hasScrolledToBottom && (
            <div className="border-t border-gray-200 p-4 bg-yellow-50">
              <p className="text-sm text-yellow-800 flex items-center">
                <Scroll className="h-4 w-4 mr-2" />
                Scroll naar beneden om het volledige contract te lezen
              </p>
            </div>
          )}

          {hasScrolledToBottom && (
            <div className="border-t border-gray-200 p-4 bg-green-50">
              <p className="text-sm text-green-800 flex items-center">
                <Check className="h-4 w-4 mr-2" />
                U heeft het volledige contract gelezen
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modal version
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Reserveringsovereenkomst
              </h3>
              <p className="text-sm text-gray-600">
                {contractVariables.unitTypeLabel} {contractVariables.unitNummer}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        <div 
          className="flex-1 overflow-y-auto p-8 prose prose-sm max-w-none"
          onScroll={handleScroll}
        >
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
            {contractText}
          </pre>
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-between items-center">
          {!hasScrolledToBottom ? (
            <div className="flex items-center text-sm text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg">
              <Scroll className="h-4 w-4 mr-2" />
              Scroll naar beneden om het volledige contract te lezen
            </div>
          ) : (
            <div className="flex items-center text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
              <Check className="h-4 w-4 mr-2" />
              Volledig gelezen
            </div>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sluiten
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

