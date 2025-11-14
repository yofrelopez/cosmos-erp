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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const imageId = parseInt(resolvedParams.imageId);

    // Buscar la imagen
    const image = await prisma.quoteItemImage.findUnique({
      where: { id: imageId },
      include: {
        quoteItem: {
          include: { quote: true }
        }
      }
    });

    if (!image) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
    }

    // Extraer public_id de Cloudinary desde la URL
    const urlParts = image.imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('.')[0];
    const folderPath = 'erp-vd-cosmos/quote-items';
    const publicId = `${folderPath}/${fileName}`;

    try {
      // Eliminar de Cloudinary
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.warn('Error eliminando de Cloudinary:', cloudinaryError);
      // Continuar aunque falle Cloudinary para limpiar la BD
    }

    // Eliminar de base de datos
    await prisma.quoteItemImage.delete({
      where: { id: imageId }
    });

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    });

  } catch (error) {
    console.error('Error eliminando imagen:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}