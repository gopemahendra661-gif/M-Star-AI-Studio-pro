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

  const dataUrl = canvas.toDataURL('image/png', 0.9); // 0.9 quality to keep size manageable

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png', 0.9);
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
  // Method 1: Try standard download first (works on Desktops/modern Mobile Browsers)
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

  // Method 2: Server Echo (Works on APK WebViews)
  // We create a hidden form and submit the base64 data to our API.
  // The API returns it as an attachment, triggering the Native Download Manager.
  
  const form = document.createElement('form');
  form.action = '/api/download-image';
  form.method = 'POST';
  form.target = '_self'; // _self ensures it triggers the current view's download handler

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'imageData';
  input.value = dataUrl;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};