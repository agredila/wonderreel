export const LOCKED_VISUAL_STYLE =
  'soft 3D animated-movie style, rounded friendly character design, big expressive sparkly eyes, ' +
  'smooth glossy surfaces with subtle subsurface scattering, warm cinematic global illumination, ' +
  'bright cheerful pastel palette, polished wholesome family-film CGI, kawaii';

export const BANNED_TERMS = [
  'pixar', 'disney', 'ghibli', 'dreamworks', 'illumination', 'marvel', 'dc comics',
  'mickey', 'minnie', 'elsa', 'anna', 'peppa', 'paw patrol', 'spongebob', 'barbie',
  'mario', 'pokemon', 'hello kitty', 'naruto', 'superman', 'batman', 'spiderman'
];

export const GENERATION_QUOTA_MONTHLY = Number.parseInt(process.env.GENERATION_QUOTA_MONTHLY || '1', 10);
export const GENERATION_QUOTA_UNLIMITED = process.env.GENERATION_QUOTA_UNLIMITED === 'true';

export const RATE_LIMIT_WINDOW_MS = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
export const RATE_LIMIT_MAX_REQUESTS = Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '120', 10);

export const AUTH_RATE_LIMIT_WINDOW_MS = Number.parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || String(15 * 60_000), 10);
export const AUTH_RATE_LIMIT_MAX_REQUESTS = Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '20', 10);
