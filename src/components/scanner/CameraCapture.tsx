import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RefreshCw, Settings2 } from 'lucide-react';

interface CameraCaptureProps {
  onImageCaptured: (base64Image: string) => void;
  onCancel: () => void;
  isScanning?: boolean;
}

export const CameraCapture = ({ onImageCaptured, onCancel, isScanning = false }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    stopCamera();
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err: any) {
      setError('Could not access camera. Please ensure permissions are granted.');
    }
  }, [stopCamera]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request initial permission if needed
        await navigator.mediaDevices.getUserMedia({ video: true }).then(s => s.getTracks().forEach(t => t.stop())).catch(() => {});
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        } else if (!selectedDeviceId) {
          startCamera(); // fallback
        }
      } catch (err) {
        console.error("Error getting devices:", err);
        startCamera(); // fallback
      }
    };
    getDevices();
  }, [startCamera, selectedDeviceId]);

  useEffect(() => {
    if (selectedDeviceId) {
      startCamera(selectedDeviceId);
    }
    return () => stopCamera();
  }, [selectedDeviceId, startCamera, stopCamera]);

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        // Do NOT stop camera here so we can show live background during scan
        onImageCaptured(dataUrl);
      }
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center min-h-[400px]">
      {error ? (
        <div className="text-white text-center p-4">
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => startCamera(selectedDeviceId)}
            className="flex items-center mx-auto space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
          >
            <RefreshCw size={18} />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <>
          {devices.length > 1 && (
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-end">
              <div className="bg-black/50 backdrop-blur-md rounded-lg p-2 flex items-center border border-white/10">
                <Settings2 size={16} className="text-white mr-2" />
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="bg-transparent text-white text-sm outline-none cursor-pointer max-w-[200px]"
                >
                  {devices.map((device, idx) => (
                    <option key={device.deviceId} value={device.deviceId} className="bg-gray-800">
                      {device.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-[400px] object-cover"
          />

          {isScanning && (
            <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-black/10 backdrop-blur-[1px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg" />
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg" />
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg" />
                 <div className="w-full h-1 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,1)] absolute animate-scan-line" />
              </div>
              <div className="absolute bottom-20 bg-black/60 text-white px-4 py-2 rounded-full font-mono text-sm animate-pulse">
                Tracking and Analyzing...
              </div>
            </div>
          )}
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-8 z-10">
            <button 
              onClick={() => { stopCamera(); onCancel(); }}
              disabled={isScanning}
              className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
            <button 
              onClick={captureImage}
              disabled={isScanning}
              className="p-4 bg-white rounded-full text-black hover:bg-gray-100 transition-colors shadow-xl border-4 border-gray-300 disabled:opacity-50"
            >
              <Camera size={32} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
