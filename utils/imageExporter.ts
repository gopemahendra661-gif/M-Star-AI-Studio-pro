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

// Share Function
export const shareRoastImage = async (blob: Blob): Promise<boolean> => {
  if (!blob) return false;

  // Method 1: APK Bridge
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

  // Method 2: Web Share API
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

// DOWNLOAD FUNCTION - PURE CLIENT SIDE
export const downloadRoastImage = (dataUrl: string) => {
  try {
    // Method 1: APK Bridge
    if (window.AndroidBridge && typeof window.AndroidBridge.downloadImage === 'function') {
      const base64Data = dataUrl.split(',')[1];
      window.AndroidBridge.downloadImage(base64Data, `mstar_roast_${Date.now()}.png`);
      return;
    }

    // Method 2: Client Side Blob Download (Works on 99% of devices including Android Chrome)
    const blob = dataURItoBlob(dataUrl);
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `m-star-roast-${Date.now()}.png`;
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