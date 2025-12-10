import html2canvas from 'html2canvas';

// Type Declarations for Android Bridge
declare global {
  interface Window {
    AndroidBridge?: {
      downloadImage: (base64Data: string, filename?: string) => void;
      shareImage: (base64Data: string) => void;
    };
    // Common standard interface name
    Android?: {
      downloadImage: (base64Data: string, filename?: string) => void;
      shareImage: (base64Data: string) => void;
    };
  }
}

// Helper: Convert Data URL to Blob
const dataURItoBlob = (dataURI: string) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

// Generate Image
export const generateRoastImage = async (elementId: string): Promise<{ blob: Blob | null; dataUrl: string }> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Generate canvas
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2, // High quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
        }
      }
    });

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const blob = dataURItoBlob(dataUrl);

    return { blob, dataUrl };
  } catch (error) {
    console.error('Image generation failed:', error);
    throw error;
  }
};

// --- DEDICATED APK SHARE FUNCTION ---
const shareOnAndroid = (base64Data: string): boolean => {
  try {
    // Try "AndroidBridge" name
    if (window.AndroidBridge && typeof window.AndroidBridge.shareImage === 'function') {
      window.AndroidBridge.shareImage(base64Data);
      return true;
    }
    // Try standard "Android" name
    if (window.Android && typeof window.Android.shareImage === 'function') {
      window.Android.shareImage(base64Data);
      return true;
    }
    return false;
  } catch (e) {
    console.error("APK Share execution failed", e);
    return false;
  }
};

// Main Share Function
export const shareRoastImage = async (blob: Blob): Promise<boolean> => {
  if (!blob) return false;

  try {
    // 1. Prepare Base64 (Required for APK)
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
    const base64Data = await base64Promise;

    // 2. CHECK FOR APK ENVIRONMENT FIRST
    // If we detect the bridge, we prefer using it over the web navigator.
    if (window.AndroidBridge || window.Android) {
      const success = shareOnAndroid(base64Data);
      if (success) return true;
    }

    // 3. Fallback to Web Share API (For Browser/PWA)
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'm-star-roast.png', { type: 'image/png' });
      const shareData = {
        files: [file],
        title: 'M-Star AI Studio',
        text: 'Check out this AI Roast! 🔥 Created with M-Star AI Studio.'
      };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      }
    }
  } catch (err) {
    console.warn('Share operation failed:', err);
  }
  
  return false;
};

// DOWNLOAD FUNCTION
export const downloadRoastImage = (dataUrl: string) => {
  try {
    const base64Data = dataUrl.split(',')[1];
    const filename = `m-star-roast-${Date.now()}.png`;

    // Method 1: APK Bridge
    if (window.AndroidBridge && typeof window.AndroidBridge.downloadImage === 'function') {
      window.AndroidBridge.downloadImage(base64Data, filename);
      return;
    }
    if (window.Android && typeof window.Android.downloadImage === 'function') {
        window.Android.downloadImage(base64Data, filename);
        return;
    }

    // Method 2: Client Side Blob Download
    const blob = dataURItoBlob(dataUrl);
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

  } catch (error) {
    console.error("Download failed", error);
    alert("Download blocked. Please use the Screenshot Mode.");
  }
};