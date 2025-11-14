import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const quoteItemId = parseInt(resolvedParams.id);

    // Obtener imágenes del QuoteItem
    const images = await prisma.quoteItemImage.findMany({
      where: { quoteItemId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        imageUrl: true,
        fileName: true,
        fileSize: true,
        createdAt: true
      }
    });

    return NextResponse.json({ images });

  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const quoteItemId = parseInt(resolvedParams.id);

    // Verificar que el QuoteItem existe
    const quoteItem = await prisma.quoteItem.findUnique({
      where: { id: quoteItemId },
      include: { quote: true }
    });

    if (!quoteItem) {
      return NextResponse.json({ error: 'Item de cotización no encontrado' }, { status: 404 });
    }

    // Obtener el archivo de la request
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    // Validaciones
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'El archivo es muy grande (máx. 2MB)' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no válido' }, { status: 400 });
    }

    // Verificar límite de imágenes por item (máx. 5)
    const existingImages = await prisma.quoteItemImage.count({
      where: { quoteItemId }
    });

    if (existingImages >= 5) {
      return NextResponse.json({ error: 'Máximo 5 imágenes por item' }, { status: 400 });
    }

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
        {
          folder: 'erp-vd-cosmos/quote-items',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 900, crop: 'limit' },
            { quality: '90', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const cloudinaryResult = uploadResponse as any;

    // Guardar en base de datos
    const newImage = await prisma.quoteItemImage.create({
      data: {
        quoteItemId,
        imageUrl: cloudinaryResult.secure_url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }
    });

    return NextResponse.json({
      success: true,
      image: {
        id: newImage.id,
        imageUrl: newImage.imageUrl,
        fileName: newImage.fileName,
        createdAt: newImage.createdAt
      }
    });

  } catch (error) {
    console.error('Error subiendo imagen:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}