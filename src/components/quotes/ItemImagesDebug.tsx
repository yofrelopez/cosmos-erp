'use client'

import Image from 'next/image'

interface QuoteItemImage {
  id: number
  imageUrl: string
  fileName: string
  fileSize?: number
  createdAt: string
}

interface ItemImagesDebugProps {
  quoteItemId: number
  images: QuoteItemImage[]
}

export default function ItemImagesDebug({ quoteItemId, images }: ItemImagesDebugProps) {
  console.log('ItemImagesDebug - quoteItemId:', quoteItemId);
  console.log('ItemImagesDebug - images:', images);
  console.log('ItemImagesDebug - images length:', images?.length || 0);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 border-2 border-red-200 bg-red-50">
        <p className="text-xs text-red-600">
          DEBUG: No hay imágenes (length: {images?.length || 0})
        </p>
        <p className="text-xs text-red-600">
          Quote Item ID: {quoteItemId}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-green-600 bg-green-50 p-2 border border-green-200">
        DEBUG: {images.length} imagen(es) encontrada(s) para item {quoteItemId}
      </div>
      
      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((image, index) => (
          <div key={image.id} className="relative group">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={image.imageUrl}
                alt={image.fileName}
                width={120}
                height={120}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Error loading image:', image.imageUrl, e);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', image.imageUrl);
                }}
              />
            </div>
            
            <div className="mt-1 text-xs text-gray-600">
              <p>ID: {image.id}</p>
              <p>Archivo: {image.fileName}</p>
              <p className="truncate">URL: {image.imageUrl}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}