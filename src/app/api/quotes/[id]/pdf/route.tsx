// app/api/quotes/[id]/pdf/route.tsx - VERSIÓN PROFESIONAL MEJORADA
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { prisma } from '@/lib/prisma';
import {
  Document,
  Page,
  Text,
  View,
  Image as PdfImage,
  StyleSheet,
  Font,
  renderToStream,
} from '@react-pdf/renderer';
import { QuoteItem } from '@prisma/client';

/* -------------------------------------------------------------------
   1) FUENTE CORPORATIVA
------------------------------------------------------------------- */
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: path.resolve(process.cwd(), 'public/fonts/Inter-Regular.ttf'),
      fontWeight: 'normal',
    },
    {
      src: path.resolve(process.cwd(), 'public/fonts/Inter-Bold.ttf'),
      fontWeight: 'bold',
    },
    {
      src: path.resolve(process.cwd(), 'public/fonts/Inter-Italic.ttf'),
      fontStyle: 'italic',
      fontWeight: 'normal',
    },
    {
      src: path.resolve(process.cwd(), 'public/fonts/Inter-BoldItalic.ttf'),
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

const logoBuf = fs.readFileSync(
  path.resolve(process.cwd(), 'public/logo_2.png')
);

/* -------------------------------------------------------------------
   1.5) HELPER PARA LOGO DINÁMICO
------------------------------------------------------------------- */
async function getCompanyLogo(company: any) {
  // Si la empresa tiene logoUrl y es una URL de Cloudinary/web, usarla
  if (company?.logoUrl && company.logoUrl.startsWith('http')) {
    try {
      // Para usar URLs remotas en react-pdf necesitamos fetch y convertir a buffer
      const response = await fetch(company.logoUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
    } catch (error) {
      console.warn('Error fetching company logo:', error);
    }
  }
  
  // Fallback al logo por defecto
  return logoBuf;
}

/* -------------------------------------------------------------------
   2) PALETA DE COLORES PROFESIONAL
------------------------------------------------------------------- */
const COLORS = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  accent: '#0ea5e9',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray900: '#111827',
  success: '#10b981',
  warning: '#f59e0b',
};

/* -------------------------------------------------------------------
   3) ESTILOS PROFESIONALES MEJORADOS
------------------------------------------------------------------- */
const styles = StyleSheet.create({
  page: {
    padding: 32,
    paddingBottom: 80, // Espacio reservado para el footer
    fontFamily: 'Inter',
    fontSize: 10,
    color: COLORS.gray900,
    backgroundColor: '#ffffff',
  },
  
  // TIPOGRAFÍA
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.primary,
  },
  subheading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.gray700,
  },
  
  /* CABECERA PROFESIONAL MEJORADA */
  headerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
    paddingVertical: 20,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  
  /* Sección de Marca/Logo - Lado Izquierdo - Diseño Vertical */
  brandSection: { 
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 2,
    gap: 4,
    marginTop: -10,
  },
  logoContainer: {
    width: 220,
    height: 70,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  brandInfo: {
    width: '100%',
    marginTop: -2,
  },
  companyTagline: {
    fontSize: 11,
    color: COLORS.gray700,
    fontWeight: 'normal',
    marginBottom: 6,
    marginTop: 0,
    textAlign: 'left',
    fontStyle: 'italic',
  },
  companyDetails: {
    fontSize: 9,
    color: COLORS.gray600,
    lineHeight: 1.5,
  },
  companyDetailRow: {
    marginBottom: 3,
  },

  /* Sección de Cotización - Lado Derecho */
  quoteBadgeContainer: { 
    alignItems: 'flex-end',
    minWidth: 200,
    paddingLeft: 20,
  },
  quoteTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
    letterSpacing: 1,
  },
  quoteNumber: {
    fontSize: 16,
    color: COLORS.gray700,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },

  /* SECCIONES DE INFORMACIÓN */
  section: { 
    marginTop: 12, 
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 6,
  },
  
  twoCol: { 
    flexDirection: 'row', 
    gap: 32,
  },
  col: { 
    flex: 1, 
    gap: 6,
  },
  infoCard: {
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 6,
    border: `1px solid ${COLORS.gray200}`,
  },

  label: { 
    fontWeight: 'bold', 
    marginBottom: 3, 
    fontSize: 9,
    color: COLORS.gray700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 10,
    color: COLORS.gray900,
    marginBottom: 4,
  },
  muted: { 
    color: COLORS.gray500,
    fontSize: 9,
  },

  /* TABLA PROFESIONAL */
  tableContainer: {
    border: `1px solid ${COLORS.gray300}`,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  tableRow: { 
    flexDirection: 'row', 
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tableRowEven: {
    backgroundColor: COLORS.gray50,
  },

  // Columnas de la tabla
  colDesc:  { width: '40%', paddingRight: 8 },
  colUnit:  { width: '12%', textAlign: 'center', paddingHorizontal: 4 },
  colQty:   { width: '12%', textAlign: 'right', paddingHorizontal: 4 },
  colPrice: { width: '18%', textAlign: 'right', paddingHorizontal: 4 },
  colSub:   { width: '18%', textAlign: 'right', paddingLeft: 8 },

  // Estilos de texto para tabla
  th: { 
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  td: {
    fontSize: 9,
    color: COLORS.gray900,
  },

  /* TOTALES PROFESIONALES */
  totalsContainer: {
    marginTop: 16,
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 6,
    border: `1px solid ${COLORS.gray200}`,
  },
  totalsBox: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end',
  },
  totalsCol: { 
    width: '50%', 
    gap: 6,
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalFinalRow: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    paddingTop: 6,
    marginTop: 6,
  },
  totalLabel: { 
    fontWeight: 'bold',
    fontSize: 12,
    color: COLORS.primary,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.primary,
  },

  /* MODALIDADES DE PAGO PROFESIONALES */
  paymentSection: {
    marginTop: 12,
  },
  paymentCard: {
    backgroundColor: COLORS.gray50,
    padding: 16,
    borderRadius: 8,
    border: `1px solid ${COLORS.gray200}`,
    marginTop: 8,
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray300,
  },
  paymentGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  paymentCol: {
    flex: 1,
  },
  bankAccount: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 4,
    border: `1px solid ${COLORS.gray300}`,
    marginBottom: 6,
  },
  bankName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  accountInfo: {
    fontSize: 9,
    color: COLORS.gray700,
    marginBottom: 1,
  },
  
  /* NOTAS PROFESIONALES */
  notesCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#fef3c7',
    border: `1px solid #fbbf24`,
    borderRadius: 6,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: '#92400e',
    lineHeight: 1.4,
  },

  /* PIE DE PÁGINA */
  footerFixed: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: COLORS.gray600,
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray300,
    marginBottom: 4,
  },
  footerText: {
    textAlign: 'center',
    marginBottom: 2,
  },
});

/* -------------------------------------------------------------------
   4) CONSULTA A BD CON INFORMACIÓN COMPLETA
------------------------------------------------------------------- */
async function getQuote(id: number) {
  return prisma.quote.findUniqueOrThrow({
    where: { id },
    include: { 
      client: true, 
      items: true,
      company: {
        include: {
          bankAccounts: true,
          wallets: true,
        }
      }
    },
  });
}

/* -------------------------------------------------------------------
   5) COMPONENTE PRINCIPAL PDF MEJORADO
------------------------------------------------------------------- */
function QuotePdf({ quote, logoBuffer }: { 
  quote: Awaited<ReturnType<typeof getQuote>>, 
  logoBuffer: Buffer 
}) {
  const date = new Date(quote.createdAt).toLocaleDateString('es-PE');
  const validUntil = new Date(quote.createdAt);
  validUntil.setDate(validUntil.getDate() + 15);

  const company = quote.company;

  /* Componente Header Profesional Mejorado */
  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        {/* Sección de Marca - Lado Izquierdo - Diseño Vertical */}
        <View style={styles.brandSection}>
          {/* Logo de la empresa (rectangular, arriba) */}
          <View style={styles.logoContainer}>
            <PdfImage 
              src={logoBuffer} 
              style={{ width: 210, height: 60 }} 
            />
          </View>
          
          {/* Información de la empresa */}
          <View style={styles.brandInfo}>
            {/* Detalles de contacto dinámicos */}
            <View style={styles.companyDetailRow}>
              <Text style={styles.companyDetails}>
                RUC: {company?.ruc || '20609799090'}    {company?.address || 'Jr. Arequipa Nro. 230 - Barranca'}
              </Text>
            </View>
            
            <View style={styles.companyDetailRow}>
              <Text style={styles.companyDetails}>
                {company?.email || 'vidrieriacosmos@gmail.com'} | {company?.phone || '994 260 216'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sección de Cotización - Lado Derecho */}
        <View style={styles.quoteBadgeContainer}>
          <Text style={styles.quoteTitle}>COTIZACIÓN</Text>
          <Text style={styles.quoteNumber}>
            N.º {quote.code || `COT-${new Date().getFullYear()}-${String(quote.id).padStart(3, '0')}`}
          </Text>
          
          {/* Badge de estado */}
          <Text style={[styles.statusBadge, { 
            backgroundColor: quote.status === 'ACCEPTED' ? COLORS.success : 
                           quote.status === 'REJECTED' ? '#ef4444' : COLORS.warning 
          }]}>
            {quote.status === 'PENDING' ? 'PENDIENTE' : 
             quote.status === 'ACCEPTED' ? 'ACEPTADA' :
             quote.status === 'REJECTED' ? 'RECHAZADA' : quote.status}
          </Text>
        </View>
      </View>
    </View>
  );

  /* Información del Cliente y Cotización */
  const InfoSection = () => (
    <View style={styles.section}>
      <View style={styles.twoCol}>
        {/* Cliente */}
        <View style={styles.col}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Información del Cliente</Text>
            <Text style={styles.value}>
              {quote.client.fullName || quote.client.businessName}
            </Text>
            {quote.client.documentNumber && (
              <Text style={styles.muted}>
                {quote.client.documentType}: {quote.client.documentNumber}
              </Text>
            )}
            {quote.client.phone && (
              <Text style={styles.muted}>Teléfono: {quote.client.phone}</Text>
            )}
            {quote.client.address && (
              <Text style={styles.muted}>Dirección: {quote.client.address}</Text>
            )}
          </View>
        </View>

        {/* Detalles de Cotización */}
        <View style={styles.col}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Detalles de la Cotización</Text>
            <Text style={styles.value}>Fecha de Emisión: {date}</Text>
            <Text style={styles.value}>
              Válida hasta: {validUntil.toLocaleDateString('es-PE')}
            </Text>
            <Text style={styles.muted}>Moneda: Soles Peruanos (PEN)</Text>
          </View>
        </View>
      </View>
    </View>
  );

  /* Tabla de Items Profesional */
  const ItemsTable = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={{ width: 4, height: 4, backgroundColor: COLORS.primary, borderRadius: 2 }} />
        <Text style={styles.sectionTitle}>Detalle de Items</Text>
      </View>
      
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, styles.th]}>Descripción</Text>
          <Text style={[styles.colUnit, styles.th]}>Unidad</Text>
          <Text style={[styles.colQty, styles.th]}>Cant.</Text>
          <Text style={[styles.colPrice, styles.th]}>P. Unitario</Text>
          <Text style={[styles.colSub, styles.th]}>Subtotal</Text>
        </View>
        
        {quote.items.map((item: QuoteItem, index: number) => (
          <View 
            key={item.id} 
            style={[
              styles.tableRow, 
              index % 2 === 0 ? styles.tableRowEven : {}
            ]}
          >
            <Text style={[styles.colDesc, styles.td]}>{item.description}</Text>
            <Text style={[styles.colUnit, styles.td]}>{item.unit}</Text>
            <Text style={[styles.colQty, styles.td]}>{item.quantity}</Text>
            <Text style={[styles.colPrice, styles.td]}>S/ {item.unitPrice.toFixed(2)}</Text>
            <Text style={[styles.colSub, styles.td]}>S/ {item.subtotal.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  /* Totales Profesionales */
  const Totals = () => (
    <View style={styles.totalsContainer}>
      <View style={styles.totalsBox}>
        <View style={styles.totalsCol}>
          <View style={[styles.totalRow, styles.totalFinalRow]}>
            <Text style={styles.totalLabel}>TOTAL GENERAL</Text>
            <Text style={styles.totalAmount}>S/ {quote.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  /* Modalidades de Pago Profesionales */
  const PaymentMethods = () => (
    <View style={styles.paymentSection}>
      <View style={styles.sectionHeader}>
        <View style={{ width: 4, height: 4, backgroundColor: COLORS.primary, borderRadius: 2 }} />
        <Text style={styles.sectionTitle}>Modalidades de Pago</Text>
      </View>
      
      <View style={styles.paymentCard}>
        {company?.bankAccounts && company.bankAccounts.length > 0 && (
          <>
            <Text style={styles.paymentTitle}>
              Cuentas Bancarias Autorizadas
            </Text>
            <View style={styles.paymentGrid}>
              {company.bankAccounts.slice(0, 2).map((account, index) => (
                <View key={account.id} style={styles.paymentCol}>
                  <View style={styles.bankAccount}>
                    <Text style={styles.bankName}>{account.bank}</Text>
                    <Text style={styles.accountInfo}>
                      {account.accountType}: {account.number}
                    </Text>
                    {account.cci && (
                      <Text style={styles.accountInfo}>CCI: {account.cci}</Text>
                    )}
                    <Text style={styles.accountInfo}>
                      Moneda: {account.currency}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {company?.wallets && company.wallets.length > 0 && (
          <>
            <Text style={[styles.paymentTitle, { marginTop: 12 }]}>
              Billeteras Digitales
            </Text>
            <View style={styles.paymentGrid}>
              {company.wallets.map((wallet) => (
                <View key={wallet.id} style={styles.paymentCol}>
                  <View style={styles.bankAccount}>
                    <Text style={styles.bankName}>{wallet.type}</Text>
                    <Text style={styles.accountInfo}>{wallet.phone}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {(!company?.bankAccounts?.length && !company?.wallets?.length) && (
          <>
            <Text style={[styles.paymentTitle, { marginTop: 12 }]}>
              Cuentas Bancarias
            </Text>
            <View style={styles.paymentGrid}>
              <View style={styles.paymentCol}>
                <View style={styles.bankAccount}>
                  <Text style={styles.bankName}>Banco de Crédito del Perú</Text>
                  <Text style={styles.accountInfo}>Cuenta Corriente: 191-2345678-0-12</Text>
                  <Text style={styles.accountInfo}>CCI: 00219100234567801234</Text>
                  <Text style={styles.accountInfo}>Moneda: PEN</Text>
                </View>
              </View>
              <View style={styles.paymentCol}>
                <View style={styles.bankAccount}>
                  <Text style={styles.bankName}>Interbank</Text>
                  <Text style={styles.accountInfo}>Cuenta Corriente: 003-3012345678</Text>
                  <Text style={styles.accountInfo}>CCI: 00300000301234567890</Text>
                  <Text style={styles.accountInfo}>Moneda: PEN</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );

  /* Observaciones */
  const Notes = () => quote.notes ? (
    <View style={styles.notesCard}>
      <Text style={styles.notesTitle}>OBSERVACIONES IMPORTANTES</Text>
      <Text style={styles.notesText}>{quote.notes}</Text>
    </View>
  ) : null;

  /* Footer Profesional */
  const Footer = () => {
    // Preparar descripción con límite de 100 caracteres
    const description = company?.description || 'Gracias por confiar en nosotros. Su satisfacción es nuestro compromiso.';
    const truncatedDescription = description.length > 100 
      ? description.substring(0, 97) + '...' 
      : description;

    return (
      <View style={styles.footerFixed} fixed>
        <View style={styles.footerDivider} />
        
        {/* Primera línea: Empresa + Eslogan */}
        <Text style={styles.footerText}>
          {company?.name || 'V&D COSMOS S.R.L'}
          {company?.slogan && ` - ${company.slogan}`}
        </Text>
        
        {/* Segunda línea: Contacto (sin símbolos duplicados) */}
        <Text style={styles.footerText}>
          Email: {company?.email || 'vidrieriacosmos@gmail.com'} | Tel: {company?.phone || '994 260 216'}
        </Text>
        
        {/* Tercera línea: Descripción de la empresa */}
        <Text style={styles.footerText}>
          {truncatedDescription}
        </Text>
        
        {/* Numeración de página */}
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
        />
      </View>
    );
  };

  /* Render Principal */
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />
        <InfoSection />
        <ItemsTable />
        <Totals />
        <Footer />
      </Page>
      <Page size="A4" style={styles.page}>
        <PaymentMethods />
        <Notes />
        <Footer />
      </Page>
    </Document>
  );
}

/* -------------------------------------------------------------------
   6) ENDPOINT GET
------------------------------------------------------------------- */
export async function GET(req: Request) {
  try {
    const id = Number(new URL(req.url).pathname.split('/').at(-2));
    if (!id) return new NextResponse('Bad Request', { status: 400 });

    const quote = await getQuote(id);
    const logoBuffer = await getCompanyLogo(quote.company);
    const stream = await renderToStream(<QuotePdf quote={quote} logoBuffer={logoBuffer} />);

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="cotizacion-${quote.code || quote.id}.pdf"`,
      },
    });
  } catch (err) {
    console.error('[PDF Generator Error]', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}