import html2canvas from 'html2canvas';

export const generateRoastImage = async (elementId: string): Promise<{ blob: Blob | null, dataUrl: string }> => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Capture element not found");

  // Create canvas
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution for crisp text
    useCORS: true,
    backgroundColor: null,
    logging: false,
    allowTaint: true,
  });

  // Get Data URL (better for WebView downloads)
  const dataUrl = canvas.toDataURL('image/png');

  // Get Blob (better for Sharing API)
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
  });

  return { blob, dataUrl };
};

export const shareRoastImage = async (blob: Blob): Promise<boolean> => {
  if (!blob) return false;

  // Check if Web Share API Level 2 is supported
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
        return false;
      }
    }
  }
  return false;
};

export const downloadRoastImage = (dataUrl: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `m-star-roast-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};