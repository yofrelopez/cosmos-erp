import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { renderToStream } from '@react-pdf/renderer'
import path from 'path'
import fs from 'fs'
import {
  Document,
  Page,
  Text,
  View,
  Image as PdfImage,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Registrar fuentes
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
  ],
});

// Usar el mismo logo
const logoBuf = fs.readFileSync(
  path.resolve(process.cwd(), 'public/logo_2.png')
);

// Colores institucionales sobrios y profesionales
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
  // Color naranja institucional (solo para elementos clave)
  orange: '#ff4500',
  // Azul gris sobrio para elementos institucionales
  blueGray: '#475569',
  blueGrayLight: '#64748b',
  blueGrayDark: '#334155',
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    paddingBottom: 80,
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
    color: COLORS.success,
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
    borderBottomColor: COLORS.blueGray,
    paddingVertical: 20,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  
  /* Sección de Marca/Logo - Lado Izquierdo */
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

  /* Sección de Contrato - Lado Derecho */
  quoteBadgeContainer: { 
    alignItems: 'flex-end',
    minWidth: 200,
    paddingLeft: 20,
  },
  contractTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.orange,
    marginBottom: 6,
    letterSpacing: 1,
  },
  contractNumber: {
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
    backgroundColor: COLORS.blueGray,
  },

  /* SECCIONES DE INFORMACIÓN */
  section: { 
    marginTop: 10, 
    marginBottom: 6,
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
    color: COLORS.blueGray,
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
    marginTop: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.blueGray,
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
  colDesc:  { width: '40%', paddingRight: 8, flexDirection: 'column' },
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
  
  // Estilos para descripción de items
  itemDescription: {
    fontSize: 9,
    color: COLORS.gray900,
    marginBottom: 3,
    lineHeight: 1.2,
  },
  imageReference: {
    fontSize: 8,
    color: COLORS.gray600,
    fontStyle: 'italic',
    lineHeight: 1.1,
  },

  /* TOTALES PROFESIONALES - COMPACTOS */
  totalsContainer: {
    marginTop: 12,
    backgroundColor: COLORS.gray50,
    padding: 8,
    borderRadius: 6,
    border: `1px solid ${COLORS.gray200}`,
  },
  totalsBox: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end',
  },
  totalsCol: { 
    width: '50%', 
    gap: 4,
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalFinalRow: {
    borderTopWidth: 2,
    borderTopColor: COLORS.blueGray,
    paddingTop: 4,
    marginTop: 4,
  },
  totalLabel: { 
    fontWeight: 'bold',
    fontSize: 12,
    color: COLORS.blueGray,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.blueGray,
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
    color: COLORS.blueGray,
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
    color: COLORS.blueGray,
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
    backgroundColor: '#f8fafc',
    border: `1px solid ${COLORS.blueGray}`,
    borderRadius: 6,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.blueGrayDark,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: COLORS.blueGrayDark,
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

  /* ESTILOS PARA PÁGINAS DE IMÁGENES */
  imagePageHeader: {
    backgroundColor: COLORS.gray100,
    padding: 8,
    marginBottom: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  imagePageTitle: {
    color: COLORS.gray700,
    fontSize: 12,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  fullImage: {
    width: '100%',
    maxHeight: 600,
    objectFit: 'contain',
  },
  imageInfo: {
    backgroundColor: COLORS.gray50,
    padding: 12,
    marginTop: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  imageInfoText: {
    fontSize: 10,
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: 2,
  },
});

function formatCurrency(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

// Función para obtener logo de empresa (helper del PDF original)
async function getCompanyLogo(company: any) {
  if (company?.logoUrl && company.logoUrl.startsWith('http')) {
    try {
      const response = await fetch(company.logoUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
    } catch (error) {
      console.warn('Error fetching company logo:', error);
    }
  }
  return logoBuf;
}

// Componente PDF completo para contrato (igual que cotización)
function ContractPdf({ contract, logoBuffer }: { 
  contract: any,
  logoBuffer: Buffer 
}) {
  const date = new Date(contract.date).toLocaleDateString('es-PE');
  const validUntil = new Date(contract.date);
  validUntil.setDate(validUntil.getDate() + 30); // Contratos válidos por 30 días

  const company = contract.company;
  const total = contract.amountPaid + contract.amountPending;

  /* Componente Header Profesional para Contrato */
  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        {/* Sección de Marca - Lado Izquierdo */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <PdfImage 
              src={logoBuffer} 
              style={{ width: 210, height: 60 }} 
            />
          </View>
          
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

        {/* Sección de Contrato - Lado Derecho */}
        <View style={styles.quoteBadgeContainer}>
          <Text style={styles.contractTitle}>CONTRATO</Text>
          <Text style={styles.contractNumber}>
            N.º {contract.code}
          </Text>
          
          <Text style={styles.statusBadge}>
            ACEPTADO
          </Text>
        </View>
      </View>
    </View>
  );

  /* Información del Cliente y Contrato */
  const InfoSection = () => (
    <View style={styles.section}>
      <View style={styles.twoCol}>
        {/* Cliente */}
        <View style={styles.col}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Información del Cliente</Text>
            <Text style={styles.value}>
              {contract.client.fullName || contract.client.businessName}
            </Text>
            {contract.client.documentNumber && (
              <Text style={styles.muted}>
                {contract.client.documentType}: {contract.client.documentNumber}
              </Text>
            )}
            {contract.client.phone && (
              <Text style={styles.muted}>Teléfono: {contract.client.phone}</Text>
            )}
            {contract.client.address && (
              <Text style={styles.muted}>Dirección: {contract.client.address}</Text>
            )}
          </View>
        </View>

        {/* Detalles de Contrato */}
        <View style={styles.col}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Detalles del Contrato</Text>
            <Text style={styles.value}>Fecha de Contrato: {date}</Text>
            <Text style={styles.value}>
              Válido hasta: {validUntil.toLocaleDateString('es-PE')}
            </Text>
            <Text style={styles.muted}>Moneda: Soles Peruanos (PEN)</Text>
            <Text style={styles.muted}>Estado: Aceptado</Text>
          </View>
        </View>
      </View>
    </View>
  );

  /* Tabla de Items igual que en cotización */
  const ItemsTable = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={{ width: 4, height: 4, backgroundColor: COLORS.blueGray, borderRadius: 2 }} />
        <Text style={[styles.sectionTitle, { color: COLORS.blueGray }]}>Detalle de Items Contratados</Text>
      </View>
      
      <View style={styles.tableContainer}>
        <View style={[styles.tableHeader, { backgroundColor: COLORS.blueGray }]}>
          <Text style={[styles.colDesc, styles.th]}>Descripción</Text>
          <Text style={[styles.colUnit, styles.th]}>Unidad</Text>
          <Text style={[styles.colQty, styles.th]}>Cant.</Text>
          <Text style={[styles.colPrice, styles.th]}>P. Unitario</Text>
          <Text style={[styles.colSub, styles.th]}>Subtotal</Text>
        </View>
        
        {contract.items.map((item: any, index: number) => {
          const hasImages = item.images && item.images.length > 0;
          const imageIndicator = hasImages 
            ? `(ver imagen${item.images.length > 1 ? 's' : ''} ${item.images.map((_: any, i: number) => i + 1).join(', ')})` 
            : '';
          
          
          return (
            <View 
              key={item.id} 
              style={[
                styles.tableRow, 
                index % 2 === 0 ? styles.tableRowEven : {}
              ]}
            >
              <View style={[styles.colDesc, styles.td]}>
                <Text style={styles.itemDescription}>
                  {item.description}
                </Text>
                {hasImages && (
                  <Text style={styles.imageReference}>
                    {imageIndicator}
                  </Text>
                )}
              </View>
              <Text style={[styles.colUnit, styles.td]}>{item.unit}</Text>
              <Text style={[styles.colQty, styles.td]}>{item.quantity}</Text>
              <Text style={[styles.colPrice, styles.td]}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={[styles.colSub, styles.td]}>{formatCurrency(item.subtotal)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  /* Totales del Contrato */
  const Totals = () => (
    <View style={styles.totalsContainer} break={false}>
      <View style={styles.totalsBox}>
        <View style={styles.totalsCol}>
          <View style={styles.totalRow}>
            <Text style={styles.label}>Monto Pagado:</Text>
            <Text style={styles.value}>{formatCurrency(contract.amountPaid)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.label}>Monto Pendiente:</Text>
            <Text style={styles.value}>{formatCurrency(contract.amountPending)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalFinalRow]}>
            <Text style={[styles.totalLabel, { color: COLORS.orange }]}>TOTAL CONTRATO</Text>
            <Text style={[styles.totalAmount, { color: COLORS.orange }]}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  /* Modalidades de Pago */
  const PaymentMethods = () => (
    <View style={styles.paymentSection}>
      <View style={styles.sectionHeader}>
        <View style={{ width: 4, height: 4, backgroundColor: COLORS.blueGray, borderRadius: 2 }} />
        <Text style={[styles.sectionTitle, { color: COLORS.blueGray }]}>Modalidades de Pago</Text>
      </View>
      
      <View style={styles.paymentCard}>
        {company?.bankAccounts && company.bankAccounts.length > 0 && (
          <>
            <Text style={[styles.paymentTitle, { color: COLORS.blueGray }]}>
              Cuentas Bancarias Autorizadas
            </Text>
            <View style={styles.paymentGrid}>
              {company.bankAccounts.slice(0, 2).map((account: any) => (
                <View key={account.id} style={styles.paymentCol}>
                  <View style={styles.bankAccount}>
                    <Text style={[styles.bankName, { color: COLORS.blueGray }]}>{account.bank}</Text>
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
            <Text style={[styles.paymentTitle, { marginTop: 12, color: COLORS.blueGray }]}>
              Billeteras Digitales
            </Text>
            <View style={styles.paymentGrid}>
              {company.wallets.map((wallet: any) => (
                <View key={wallet.id} style={styles.paymentCol}>
                  <View style={styles.bankAccount}>
                    <Text style={[styles.bankName, { color: COLORS.blueGray }]}>{wallet.type}</Text>
                    <Text style={styles.accountInfo}>{wallet.phone}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );

  /* Observaciones del Contrato */
  const Notes = () => contract.notes ? (
    <View style={[styles.notesCard, { backgroundColor: '#f8fafc', borderColor: COLORS.blueGray }]}>
      <Text style={[styles.notesTitle, { color: COLORS.blueGrayDark }]}>TÉRMINOS DEL CONTRATO</Text>
      <Text style={[styles.notesText, { color: COLORS.blueGrayDark }]}>{contract.notes}</Text>
    </View>
  ) : null;

  /* Footer Profesional */
  const Footer = () => {
    const description = company?.description || 'Gracias por confiar en nosotros. Su satisfacción es nuestro compromiso.';
    const truncatedDescription = description.length > 100 
      ? description.substring(0, 97) + '...' 
      : description;

    return (
      <View style={styles.footerFixed} fixed>
        <View style={styles.footerDivider} />
        
        <Text style={styles.footerText}>
          {company?.name || 'V&D COSMOS S.R.L'}
          {company?.slogan && ` - ${company.slogan}`}
        </Text>
        
        <Text style={styles.footerText}>
          Email: {company?.email || 'vidrieriacosmos@gmail.com'} | Tel: {company?.phone || '994 260 216'}
        </Text>
        
        <Text style={styles.footerText}>
          {truncatedDescription}
        </Text>
        
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
        />
      </View>
    );
  };

  /* Componente para página de imagen individual */
  const ImagePage = ({ item, image, imageIndex, totalImages }: { 
    item: any, 
    image: any, 
    imageIndex: number, 
    totalImages: number 
  }) => (
    <Page size="A4" style={styles.page}>
      {/* Header sutil */}
      <View style={styles.imagePageHeader}>
        <Text style={styles.imagePageTitle}>
          Imagen {imageIndex + 1} de {totalImages} - CONTRATO {contract.code}
        </Text>
      </View>

      {/* Imagen centrada */}
      <View style={styles.imageContainer}>
        <PdfImage
          src={image.imageUrl.replace('/upload/', '/upload/q_95,f_auto/')}
          style={styles.fullImage}
        />
      </View>

      {/* Información del item */}
      <View style={styles.imageInfo}>
        <Text style={styles.imageInfoText}>
          {item.description.substring(0, 80)}{item.description.length > 80 ? '...' : ''}
        </Text>
        <Text style={styles.imageInfoText}>
          Cantidad: {item.quantity} {item.unit} | Precio: S/ {item.unitPrice.toFixed(2)}
        </Text>
      </View>

      <Footer />
    </Page>
  );

  /* Render Principal */
  return (
    <Document>
      {/* PÁGINA 1: Contenido principal */}
      <Page size="A4" style={styles.page}>
        <Header />
        <InfoSection />
        <ItemsTable />
        <Totals />
        <Footer />
      </Page>

      {/* PÁGINAS DE IMÁGENES: Una página por imagen */}
      {contract.items.map((item: any) =>
        item.images?.map((image: any, imageIndex: number) => (
          <ImagePage
            key={`${item.id}-${image.id}`}
            item={item}
            image={image}
            imageIndex={imageIndex}
            totalImages={item.images.length}
          />
        ))
      )}

      {/* PÁGINA FINAL: Datos bancarios y términos */}
      <Page size="A4" style={styles.page}>
        <PaymentMethods />
        <Notes />
        <Footer />
      </Page>
    </Document>
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    const quoteIdNum = parseInt(quoteId);
    
    // 1. Buscar el contrato asociado a esta cotización
    const contract = await prisma.contract.findUnique({
      where: { quoteId: quoteIdNum },
      include: {
        client: true,
        items: {
          include: {
            images: true
          }
        },
        company: {
          include: {
            bankAccounts: true,
            wallets: true,
          }
        },
        quote: true
      }
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'No existe un contrato para esta cotización' },
        { status: 404 }
      );
    }

    // 2. Obtener logo de la empresa
    const logoBuffer = await getCompanyLogo(contract.company);

    // 3. Generar PDF del contrato
    const stream = await renderToStream(
      <ContractPdf contract={contract} logoBuffer={logoBuffer} />
    );

    // 4. Devolver el PDF
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="contrato-${contract.code}.pdf"`,
      },
    });

  } catch (error) {
    console.error('[GET /api/contracts/by-quote/[quoteId]/pdf]', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}