export function shareViaWhatsApp(text: string): void {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

export function shareViaEmail(subject: string, body: string, to = ''): void {
  const params = new URLSearchParams({ subject, body });
  if (to) params.set('to', to);
  window.location.href = `mailto:${to}?${params.toString()}`;
}
