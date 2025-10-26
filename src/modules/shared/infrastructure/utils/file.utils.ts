import axios from 'axios';

export async function downloadAndEncodeImage(
  url: string,
): Promise<{ base64Image: string; mimeType: string }> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });

  let mimeType = response.headers['content-type'] as string;
  if (!mimeType || mimeType === 'application/octet-stream') {
    mimeType = 'image/jpeg';
  }

  if (mimeType !== 'image/jpeg' && !mimeType.startsWith('image/')) {
    throw new Error(`URL does not point to a valid image type: ${mimeType}`);
  }

  const base64Image = Buffer.from(response.data).toString('base64');
  return { base64Image, mimeType };
}
