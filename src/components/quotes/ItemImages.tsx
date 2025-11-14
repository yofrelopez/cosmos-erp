'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, X, Eye, Loader2, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface QuoteItemImage {
  id: number
  imageUrl: string
  fileName: string
  fileSize?: number
  createdAt: string
}

interface ItemImagesProps {
  quoteItemId: number
  images: QuoteItemImage[]
  onImagesChange: () => void
  readonly?: boolean
}

export default function ItemImages({ quoteItemId, images, onImagesChange, readonly = false }: ItemImagesProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validaciones
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El archivo es muy grande (máx. 2MB)')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Tipo de archivo no válido (solo JPG, PNG, WebP)')
      return
    }

    if (images.length >= 5) {
      toast.error('Máximo 5 imágenes por item')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch(`/api/quote-items/${quoteItemId}/images`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error subiendo imagen')
      }

      const result = await response.json()
      toast.success('Imagen subida correctamente')
      onImagesChange()
    } catch (error: any) {
      toast.error(error.message || 'Error subiendo imagen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return

    try {
      const response = await fetch(`/api/quote-item-images/${imageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error eliminando imagen')
      }

      toast.success('Imagen eliminada correctamente')
      onImagesChange()
    } catch (error: any) {
      toast.error(error.message || 'Error eliminando imagen')
    }
  }

  return (
    <div className="space-y-3">
      {/* Botón de subida */}
      {!readonly && (
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= 5}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 
                       border border-blue-200 rounded-lg hover:bg-blue-100 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
            {uploading ? 'Subiendo...' : 'Agregar imagen'}
          </button>
          <span className="text-xs text-gray-500">
            {images.length}/5 imágenes
          </span>
        </div>
      )}

      {/* Grid de imágenes */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={image.imageUrl}
                  alt={image.fileName}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                              transition-opacity rounded-lg flex items-center justify-center gap-2">
                <button
                  onClick={() => setSelectedImage(image.imageUrl)}
                  className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                  title="Ver imagen"
                >
                  <Eye className="h-3 w-3 text-gray-700" />
                </button>
                
                {!readonly && (
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="p-1.5 bg-red-500/90 rounded-full hover:bg-red-500 transition-colors"
                    title="Eliminar imagen"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-xs">No hay imágenes</p>
        </div>
      )}

      {/* Modal de vista de imagen */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={selectedImage}
              alt="Imagen ampliada"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white 
                         hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}