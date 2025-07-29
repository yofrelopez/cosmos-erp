// app/api/quotes/[id]/pdf/route.tsx
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { prisma }       from '@/lib/prisma';
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

// Make sure you have these .ttf files in your public/fonts directory or another accessible location

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


// LOGO

const logoBuf = fs.readFileSync(
  path.resolve(process.cwd(), 'public/logo_2.png')
);

/* -------------------------------------------------------------------
   2) PALETA DE COLORES (azul Cosmos + grises neutros)
------------------------------------------------------------------- */
const COLORS = {
  primary: '#1d4ed8', // azul Cosmos
  gray100: '#f3f4f6',
  gray300: '#d1d5db',
  gray600: '#4b5563',
};

/* -------------------------------------------------------------------
   3) ESTILOS GENERALES
------------------------------------------------------------------- */
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 9,
    color: '#111',
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  boldItalicText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  normalText: {
    fontSize: 10,
  },

  /* CABECERA ----------------------------------------------------- */
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brandLeft: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  brandName: { fontSize: 16, fontWeight: 600, color: COLORS.primary },
  companyInfo: { marginTop: 4, color: COLORS.gray600 },

  quoteBadgeBox: { textAlign: 'right' },
  badge: {
    backgroundColor: COLORS.primary,
    color: '#fff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 600,
  },

  /* BLOQUES INFO ------------------------------------------------- */
  section: { marginTop: 24 },
  twoCol: { flexDirection: 'row', gap: 40 },
  col: { flex: 1, gap: 4 },

  label: { fontWeight: 600, marginBottom: 2, fontSize: 9 },
  muted: { color: COLORS.gray600 },

  /* TABLA ÍTEMS -------------------------------------------------- */
  table: { marginTop: 16 },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderTop: `1 solid ${COLORS.gray300}`,
    borderBottom: `1 solid ${COLORS.gray300}`,
    paddingVertical: 6,
  },
  tableRow: { flexDirection: 'row', borderBottom: `1 solid ${COLORS.gray100}`, paddingVertical: 4 },

  colDesc:  { width: '40%' },
  colUnit:  { width: '12%', textAlign: 'center' },
  colQty:   { width: '12%', textAlign: 'right' },
  colPrice: { width: '18%', textAlign: 'right' },
  colSub:   { width: '18%', textAlign: 'right' },

  th: { fontWeight: 600 },

  /* TOTALES ------------------------------------------------------ */
  totalsBox: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  totalsCol: { width: '40%', gap: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontWeight: 600 },

  /* PAYMENT / NOTES --------------------------------------------- */
  card: {
    marginTop: 16,
    padding: 10,
    border: `1 solid ${COLORS.gray300}`,
    backgroundColor: COLORS.gray100,
    gap: 4,
  },

  /* PIE ---------------------------------------------------------- */
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
   4) CONSULTA A BD
------------------------------------------------------------------- */
async function getQuote(id: number) {
  return prisma.quote.findUniqueOrThrow({
    where: { id },
    include: { client: true, items: true },
  });
}

/* -------------------------------------------------------------------
   5) COMPONENTE PRINCIPAL PDF
------------------------------------------------------------------- */
function QuotePdf({ quote }: { quote: Awaited<ReturnType<typeof getQuote>> }) {
  const date = new Date(quote.createdAt).toLocaleDateString('es-PE');
  const validUntil = new Date(quote.createdAt);
  validUntil.setDate(validUntil.getDate() + 15); // ejemplo: 15 días de validez

  /* Sub‑componentes auxiliares ---------------------------------- */
  const Header = () => (
    <View style={styles.headerRow}>
      {/* — izquierda — */}
      <View style={styles.brandLeft}>
        <PdfImage src={logoBuf} style={{ width: 42, height: 42 }} />
        <View>
          <Text style={styles.brandName}>Vidriería Cosmos</Text>
          <Text style={styles.companyInfo}>RUC 20401234567</Text>{/* 🏷️ cambia RUC */}
          <Text style={styles.companyInfo}>Av. Lima 123, Barranca</Text>{/* 🏷️ dirección */}
          <Text style={styles.companyInfo}>ventas@cosmos.pe | 01 345‑6789</Text>{/* 🏷️ contacto */}
        </View>
      </View>

      {/* — derecha — */}
      <View style={styles.quoteBadgeBox}>
        <Text style={{ fontSize: 20, fontWeight: 600 }}>COTIZACIÓN</Text>
        <Text style={{ marginTop: 2 }}>N.º {quote.code}</Text>
        {/* Estado destacado */}
        <Text style={[styles.badge, { marginTop: 6 }]}>{quote.status}</Text>
      </View>
    </View>
  );

  const InfoBlocks = () => (
    <View style={[styles.section, styles.twoCol]}>
      {/* Cliente */}
      <View style={styles.col}>
        <Text style={styles.label}>Cliente</Text>
        <Text>{quote.client.fullName}</Text>
        {quote.client.documentNumber && <Text style={styles.muted}>Doc: {quote.client.documentNumber}</Text>}
      </View>
      {/* Cotización */}
      <View style={styles.col}>
        <Text style={styles.label}>Detalles</Text>
        <Text>Fecha: {date}</Text>
        <Text>Válido hasta: {validUntil.toLocaleDateString('es-PE')}</Text>
      </View>
    </View>
  );

  const ItemsTable = () => (
    <View style={[styles.section, styles.table]}>
      <View style={styles.tableHead}>
        <Text style={[styles.colDesc, styles.th]}>Descripción</Text>
        <Text style={[styles.colUnit, styles.th]}>Unidad</Text>
        <Text style={[styles.colQty,  styles.th]}>Cant.</Text>
        <Text style={[styles.colPrice,styles.th]}>Unitario</Text>
        <Text style={[styles.colSub,  styles.th]}>Subtotal</Text>
      </View>
      {quote.items.map((i: QuoteItem) => (
        <View key={i.id} style={styles.tableRow}>
          <Text style={styles.colDesc}>{i.description}</Text>
          <Text style={styles.colUnit}>{i.unit}</Text>
          <Text style={styles.colQty}>{i.quantity}</Text>
          <Text style={styles.colPrice}>S/ {i.unitPrice.toFixed(2)}</Text>
          <Text style={styles.colSub}>S/ {i.subtotal.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );

  const Totals = () => (
    <View style={styles.totalsBox}>
      <View style={styles.totalsCol}>
        {/* Subtotal e IGV si aplica */}
        {/* <View style={styles.totalRow}>
          <Text>Subtotal</Text>
          <Text>S/ {quote.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>IGV (18 %)</Text>
          <Text>S/ {quote.tax.toFixed(2)}</Text>
        </View> */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalLabel}>S/ {quote.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const Payment = () => (
    <View style={styles.card}>
      <Text style={styles.label}>Forma de pago</Text>
      <Text>Depósito bancario – 50 % al aceptar, 50 % contra entrega.</Text>
      <Text style={styles.label}>Cuentas bancarias</Text>
      <Text>BCP (Soles): 191‑0000000‑0‑00</Text>
      <Text>Interbank (Soles): 003‑0000000000</Text>
    </View>
  );

  const Notes = () => quote.notes ? (
    <View style={styles.card}>
      <Text style={styles.label}>Observaciones</Text>
      <Text>{quote.notes}</Text>
    </View>
  ) : null;

const Footer = () => (
  <View style={styles.footerFixed} fixed>
    <View style={styles.footerDivider} />
    <Text style={styles.footerText}>
      Gracias por confiar en Vidriería Cosmos. Ante cualquier consulta, contáctanos.
    </Text>
    <Text
      style={styles.footerText}
      render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
    />
  </View>
);

  /* --- Render --------------------------------------------------- */
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />
        <InfoBlocks />
        <ItemsTable />
        <Totals />
        <Payment />
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
    const url = new URL(req.url);

    const id = Number(new URL(req.url).pathname.split('/').at(-2));
    if (!id) return new NextResponse('Bad Request', { status: 400 });

    const quote = await getQuote(id);
    const stream = await renderToStream(<QuotePdf quote={quote} />);

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="cotizacion-${quote.code}.pdf"`,
      },
    });
  } catch (err) {
    console.error('[PDF]', err);
    return new NextResponse('Not Found', { status: 404 });
  }
}

