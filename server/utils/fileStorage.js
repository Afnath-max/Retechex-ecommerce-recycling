import fs from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

const localUploadDir = path.resolve('server/uploads');

function getExtension(file) {
  const fromName = path.extname(file.originalname || '');
  if (fromName) return fromName.toLowerCase();

  const byMime = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };

  return byMime[file.mimetype] || '';
}

function buildFilename(file, folder) {
  const ext = getExtension(file);
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${folder}/${file.fieldname}-${unique}${ext}`;
}

export async function saveUploadedImage(file, folder = 'uploads') {
  if (!file) return '';

  const filename = buildFilename(file, folder);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(filename, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
      addRandomSuffix: true,
    });

    return blob.url;
  }

  const diskPath = path.join(localUploadDir, filename);
  await fs.mkdir(path.dirname(diskPath), { recursive: true });
  await fs.writeFile(diskPath, file.buffer);

  return `/uploads/${filename.replace(/\\/g, '/')}`;
}
