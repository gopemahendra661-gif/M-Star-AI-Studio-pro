import html2canvas from 'html2canvas';

// Type Declarations for Android Bridge
declare global {
  interface Window {
    AndroidBridge?: {
      downloadImage: (base64Data: string, filename?: string) => void;
      shareImage: (base64Data: string) => void;
    };
  }
}

// APK Compatible Download Functions
export const generateRoastImage = async (elementId: string): Promise<{ blob: Blob | null; dataUrl: string }> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Generate canvas with better quality for APK
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure all styles are loaded
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
        }
      }
    });

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    
    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
    });

    return { blob, dataUrl };
  } catch (error) {
    console.error('Image generation failed:', error);
    throw error;
  }
};

export const shareRoastImage = async (blob: Blob): Promise<boolean> => {
  if (!blob) return false;

  // Method 1: APK Bridge (If available - Best Experience)
  if (window.AndroidBridge && typeof window.AndroidBridge.shareImage === 'function') {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1];
        window.AndroidBridge?.shareImage(base64data);
      };
      return true;
    } catch (e) {
      console.error("Bridge share failed", e);
    }
  }

  // Method 2: Native Share (Level 1)
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
  // Method 1: APK Bridge (If available - Fastest)
  if (window.AndroidBridge && typeof window.AndroidBridge.downloadImage === 'function') {
    const base64Data = dataUrl.split(',')[1];
    window.AndroidBridge.downloadImage(base64Data, `mstar_roast_${Date.now()}.png`);
    return;
  }

  // Method 2: Try standard download (Desktops/Modern Browsers)
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

  // Method 3: Server Echo (Safe for APKs without Bridge)
  // We use target="_blank" so the main app doesn't navigate to a white screen if it fails.
  // This uses the API route we defined to force a file download via the browser.
  
  const form = document.createElement('form');
  
  // Anti-redirect hack: Add timestamp query param
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  form.action = `${baseUrl}/api/download-image?t=${Date.now()}`;
  
  form.method = 'POST';
  form.target = '_blank'; // Opens in system browser/new window to avoid white screen in app
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