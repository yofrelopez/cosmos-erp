'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface PendingImage {
  file: File
  preview: string
  id: string
}

interface PendingItemImagesProps {
  itemIndex: number
  onImagesChange: (itemIndex: number, images: File[]) => void
  images: File[]
}

export default function PendingItemImages({ itemIndex, onImagesChange, images }: PendingItemImagesProps) {
  const [previews, setPreviews] = useState<PendingImage[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar previews con images prop
  useEffect(() => {
    if (images.length !== previews.length) {
      const newPreviews = images.map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${itemIndex}-${index}-${Date.now()}`
      }))
      setPreviews(newPreviews)
    }
  }, [images, previews.length, itemIndex])

  const handleFileSelect = (files: FileList) => {
    const newFiles: File[] = []
    const newPreviews: PendingImage[] = []

    Array.from(files).forEach((file) => {
      // Validaciones
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} es muy grande (máx. 2MB)`)
        return
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} no es un formato válido`)
        return
      }

      if (images.length + newFiles.length >= 5) {
        toast.error('Máximo 5 imágenes por item')
        return
      }

      newFiles.push(file)
      newPreviews.push({
        file,
        preview: URL.createObjectURL(file),
        id: `${itemIndex}-${Date.now()}-${Math.random()}`
      })
    })

    if (newFiles.length > 0) {
      const updatedImages = [...images, ...newFiles]
      const updatedPreviews = [...previews, ...newPreviews]
      
      setPreviews(updatedPreviews)
      onImagesChange(itemIndex, updatedImages)
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove)
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove)
    
    // Liberar URL del preview
    if (previews[indexToRemove]) {
      URL.revokeObjectURL(previews[indexToRemove].preview)
    }
    
    setPreviews(updatedPreviews)
    onImagesChange(itemIndex, updatedImages)
  }

  return (
    <div className="space-y-3">
      {/* Botón de subida */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= 5}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-green-50 text-green-700 
                     border border-green-200 rounded-lg hover:bg-green-100 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="h-3 w-3" />
          Seleccionar imágenes
        </button>
        <span className="text-xs text-gray-500">
          {images.length}/5 imágenes
        </span>
      </div>

      {/* Grid de previews */}
      {previews.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={preview.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={preview.preview}
                  alt={`Preview ${index + 1}`}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay con acción eliminar */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                              transition-opacity rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-1.5 bg-red-500/90 rounded-full hover:bg-red-500 transition-colors"
                  title="Eliminar imagen"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
              
              {/* Indicador de archivo pendiente */}
              <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded">
                Pendiente
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-xs">Selecciona imágenes para este item</p>
          <p className="text-xs text-gray-400">Se subirán al crear la cotización</p>
        </div>
      )}
    </div>
  )
}