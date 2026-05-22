const API_BASE = 'http://localhost:5100';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  const normalizedPath = imagePath
    .replace(/\\/g, '/')
    .replace(/^file:\/\//i, '');

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  if (normalizedPath.includes('/assets/') || normalizedPath.startsWith('/assets/')) {
    return normalizedPath;
  }

  const uploadsIndex = normalizedPath.toLowerCase().lastIndexOf('/uploads/');
  const relativePath = uploadsIndex >= 0
    ? normalizedPath.slice(uploadsIndex + '/uploads/'.length)
    : normalizedPath.split('/').pop();

  return `${API_BASE}/${encodeURI(relativePath)}`;
};
