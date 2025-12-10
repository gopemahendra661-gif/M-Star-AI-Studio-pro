import html2canvas from 'html2canvas';

export const generateRoastImage = async (elementId: string): Promise<{ blob: Blob | null, dataUrl: string }> => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Capture element not found");

  // Create canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
    allowTaint: true,
  });

  const dataUrl = canvas.toDataURL('image/png', 0.95);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png', 0.95);
  });

  return { blob, dataUrl };
};

export const shareRoastImage = async (blob: Blob): Promise<boolean> => {
  if (!blob) return false;

  // Try Native Share (Level 1)
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], 'm-star-roast.png', { type: 'image/png' });
    const shareData = {
      files: [file],
      title: 'M-Star AI Studio',
      text: 'Check out this AI Roast! 🔥 Created with M-Star AI Studio.'
    };

    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (err) {
        console.warn('Share cancelled or failed:', err);
      }
    }
  }
  return false;
};

// THE REAL DOWNLOAD FIX FOR APK/WEBVIEW
export const downloadRoastImage = (dataUrl: string) => {
  // Method 1: Try standard download first (Desktops/Modern Browsers)
  const isWebView = /wv|android|iphone|ipad/i.test(navigator.userAgent);

  if (!isWebView) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `m-star-roast-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Method 2: Server Echo (Safe for APKs)
  // We use target="_blank" so the main app doesn't navigate to a white screen if it fails.
  
  const form = document.createElement('form');
  
  // Anti-redirect hack: Add timestamp query param
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  form.action = `${baseUrl}/api/download-image?t=${Date.now()}`;
  
  form.method = 'POST';
  form.target = '_blank'; // CRITICAL: Opens in system browser/new window to avoid white screen in app
  form.enctype = 'application/x-www-form-urlencoded';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'imageData';
  input.value = dataUrl;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(form);
  }, 1000);
};