// src/lib/uploads/logo.ts
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

/**
 * Configuración segura de Cloudinary (solo backend).
 * Lanza error inmediato si falta alguna variable.
 */
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary: faltan variables de entorno requeridas.');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

type UploadLogoOptions = {
  folder?: string;     // carpeta destino (por defecto 'vd-cosmos/logos')
  publicId?: string;   // nombre fijo del recurso (sin extensión), ej: 'empresa-123'
  maxBytes?: number;   // límite de tamaño opcional
};

/**
 * Sube un logo a Cloudinary y devuelve la URL segura (incluye versión /vXXXX/).
 * - Si pasas `publicId`, se sobrescribe ese recurso (mismo nombre) con `overwrite + invalidate`.
 * - Si NO pasas `publicId`, Cloudinary generará uno.
 */
export async function uploadLogo(
  file: File,
  opts: UploadLogoOptions = {}
): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('uploadLogo: archivo vacío o indefinido.');
  }
  if (opts.maxBytes && file.size > opts.maxBytes) {
    throw new Error(`uploadLogo: tamaño excede el límite (${opts.maxBytes} bytes).`);
  }
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error(`uploadLogo: tipo no permitido (${file.type}).`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadOptions: UploadApiOptions = {
    folder: opts.folder ?? 'vd-cosmos/logos',
    resource_type: 'image',
    // Si tenemos publicId, mantenemos el nombre fijo y sobrescribimos
    public_id: opts.publicId,
    overwrite: true,
    invalidate: true,       // purga CDN para ese public_id
    unique_filename: opts.publicId ? false : true,
    use_filename: !opts.publicId, // si no hay publicId, usa nombre del archivo como base
    // Entrega optimizada (Cloudinary aplicará f_auto/q_auto en la URL resultante)
    transformation: [
      {
        width: 600,
        height: 600,
        crop: 'limit',
        fetch_format: 'auto', // f_auto
        quality: 'auto',      // q_auto
      },
    ],
  };

  const secureUrl = await new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: Error | undefined, result?: UploadApiResponse) => {
        if (error || !result?.secure_url) {
          return reject(error ?? new Error('Cloudinary: sin resultado de upload.'));
        }
        resolve(result.secure_url); // incluye /vXXXX/ para busting de caché
      }
    );
    // Enviar el buffer directamente al stream (más simple que pipe)
    stream.end(buffer);
  });

  return secureUrl;
}
