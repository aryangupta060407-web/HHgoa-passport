import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Upload, 
  Download, 
  RotateCcw, 
  Share2, 
  Check, 
  X,
  Loader2,
  ArrowUpRight,
  Sparkles,
  Zap
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/croputils';
import BuilderPassportCard from './BuilderPassportCard';
import { builderService } from '../services/builderService';

export default function LandingPrototype() {
  // Image Upload & Processing State
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Modals & UI Feedback
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Unique Builder ID
  const [builderId] = useState(() => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `HHG-2026-${randomDigits}`;
  });

  const builderNumber = useMemo(() => {
    const digits = builderId.replace(/\D/g, '');
    return (parseInt(digits.slice(-3), 10) % 247) + 1;
  }, [builderId]);

  // Identity Form State
  const [builderData, setBuilderData] = useState({
    firstName: 'Aarav',
    lastName: 'Sharma',
    role: 'Full-Stack Developer',
    location: 'Goa, India',
    archetype: 'System Architect',
    techStack: 'React, Node.js, TypeScript, TailwindCSS, Rust',
  });

  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const tiltRef = useRef(null);
  const tiltRAF = useRef(null);

  // 3D tilt for the passport preview — rotates toward the cursor and
  // relaxes back to flat on leave. Throttled to one update per animation
  // frame (mousemove otherwise fires far more often than the screen can
  // repaint, forcing unnecessary re-renders on every pixel of movement).
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  const handleTiltMove = useCallback((e) => {
    const el = tiltRef.current;
    if (!el) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (tiltRAF.current) cancelAnimationFrame(tiltRAF.current);
    tiltRAF.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * 16;
      const rx = (0.5 - py) * 16;
      setTilt({ rx, ry, mx: px * 100, my: py * 100 });
    });
  }, []);

  const handleTiltLeave = useCallback(() => {
    if (tiltRAF.current) cancelAnimationFrame(tiltRAF.current);
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });
  }, []);

  useEffect(() => {
    return () => {
      if (tiltRAF.current) cancelAnimationFrame(tiltRAF.current);
    };
  }, []);

  // SVG Export Utility
  const svgToPngBlob = useCallback(async (svgElement, scale = 2) => {
    if (!svgElement) throw new Error('No card to export yet');
    const clone = svgElement.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const width = parseInt(svgElement.getAttribute('width'), 10) || 1080;
    const height = parseInt(svgElement.getAttribute('height'), 10) || 1080;

    const svgString = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to rasterize card SVG'));
        image.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      return await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas export failed'));
        }, 'image/png');
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }, []);

  // Keyboard accessibility
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (showSuccessModal) setShowSuccessModal(false);
    }
  }, [showSuccessModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBuilderData((prev) => ({ ...prev, [name]: value }));
  };

  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/avif',
    'image/heic',
    'image/heif',
    'image/svg+xml',
  ];
  // Fallback for files whose MIME type the OS/browser reports as blank or
  // generic (common with HEIC/HEIF on non-Apple platforms) — checked by
  // extension so the upload still isn't rejected outright.
  const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp|gif|bmp|tiff?|avif|heic|heif|svg)$/i;

  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    // Allow re-selecting the same file after an error without a no-op change event.
    e.target.value = '';
    if (!file) return;

    setUploadError('');

    const looksLikeImage =
      ACCEPTED_IMAGE_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.test(file.name);
    if (!looksLikeImage) {
      setUploadError('That file type isn\'t supported. Try JPG, PNG, WEBP, GIF, HEIC, AVIF, BMP, TIFF, or SVG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(`That photo is ${sizeMB}MB — please choose one under 10MB.`);
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onerror = () => {
      setIsProcessing(false);
      setUploadError('Couldn\'t read that file — it may be corrupted. Try a different photo.');
    };

    reader.onload = (event) => {
      const dataUrl = event.target.result;
      // Probe-decode before committing to state, since some formats (HEIC in
      // particular) can pass every check above but still fail to render in
      // browsers that can't decode them.
      const probe = new Image();
      probe.onload = () => {
        setImage(dataUrl);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setCroppedAreaPixels(null);
        setIsProcessing(false);
      };
      probe.onerror = () => {
        setIsProcessing(false);
        setUploadError('This browser can\'t preview that image format. Try converting it to JPG or PNG first.');
      };
      probe.src = dataUrl;
    };

    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsValue) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  useEffect(() => {
    if (!image || !croppedAreaPixels) return;
    let cancelled = false;
    (async () => {
      try {
        const cropped = await getCroppedImg(image, croppedAreaPixels, rotation);
        if (!cancelled) setCroppedImage(cropped);
      } catch (err) {
        console.error('Failed to crop image:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [image, croppedAreaPixels, rotation]);

  const handleReset = () => {
    setImage(null);
    setCroppedImage(null);
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Profile Generation & Service Persist
  const handleDownload = async () => {
    if (!cardRef.current || isProcessing) return;
    setIsProcessing(true);

    try {
      const blob = await svgToPngBlob(cardRef.current, 2);
      const firstName = builderData.firstName.trim() || 'builder';
      const lastName = builderData.lastName.trim() || 'pass';
      const filename = `HHGOA-${firstName}-${lastName}.png`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      await builderService.createBuilderProfile({
        id: builderId,
        builderNumber,
        firstName: builderData.firstName || 'Anonymous',
        lastName: builderData.lastName || 'Builder',
        role: builderData.role || 'Builder',
        location: builderData.location || 'Goa, India',
        archetype: builderData.archetype || 'System Architect',
        techStack: builderData.techStack || 'Web3, React, Node.js',
        photo: croppedImage || '',
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Failed to generate pass or persist profile:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const canShareFiles = typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare;

  // Only trust the native Web Share sheet on actual mobile devices.
  // Desktop Chrome/Edge/Safari also expose navigator.share, but their
  // OS-level share sheet only offers things like Mail/Notes/AirDrop —
  // not Twitter/X — which is what was forcing a manual "save & re-upload"
  // step. On desktop we skip straight to the pre-filled tweet intent instead.
  const isMobileDevice =
    typeof navigator !== 'undefined' &&
    (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.userAgentData && navigator.userAgentData.mobile));

  const downloadCardImage = async () => {
    const blob = await svgToPngBlob(cardRef.current, 2);
    const firstName = builderData.firstName.trim() || 'builder';
    const lastName = builderData.lastName.trim() || 'pass';
    const filename = `HHGOA-${firstName}-${lastName}.png`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareOnX = async () => {
    const tweetText = `Just claimed my Builder Identity for Hacker House Goa 2026 🚀\n\nBuilt with #FrameInGoa\n#HHGoa`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    if (!cardRef.current) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      // Generate the exact passport image currently visible in the preview.
      const blob = await svgToPngBlob(cardRef.current, 2);
      const file = new File([blob], 'hhgoa-builder-pass.png', {
        type: 'image/png',
      });

      // On phones/tablets, use the native share sheet. If X is installed,
      // the X app can receive both the image and caption together.
      if (
        isMobileDevice &&
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            text: tweetText,
            title: 'HH Goa Builder Pass',
          });
          return;
        } catch (error) {
          // User cancelled the share sheet — don't open anything else.
          if (error?.name === 'AbortError') return;
        }
      }

      // Desktop X's web intent does NOT support attaching local images.
      // Download the generated PNG automatically, then open the tweet
      // composer with the caption ready. The image is now in Downloads.
      const firstName = builderData.firstName.trim() || 'builder';
      const lastName = builderData.lastName.trim() || 'pass';
      const filename = `HHGOA-${firstName}-${lastName}.png`;

      const imageUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Give the browser a moment to start the download before opening X.
      setTimeout(() => {
        URL.revokeObjectURL(imageUrl);
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }, 250);
    } catch (error) {
      console.error('Failed to prepare pass image for sharing:', error);

      // Even if image generation fails, don't leave the user stuck.
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B3D2A] text-[#F6EFDD] font-['Space_Mono'] selection:bg-[#F2C14E] selection:text-black antialiased relative overflow-x-hidden">

      {/* Fonts + Liquid Glass keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,900;1,9..144,700&family=Space+Mono:wght@400;700&family=Silkscreen:wght@400;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; font-feature-settings: 'ss01' 1; }
        .font-pixel { font-family: 'Silkscreen', monospace; }
        @keyframes liquidSheen {
          0%, 100% { transform: translateX(-30%) rotate(8deg); opacity: 0.35; }
          50% { transform: translateX(30%) rotate(8deg); opacity: 0.55; }
        }
        .liquid-sheen::before {
          content: '';
          position: absolute;
          inset: -40% -10%;
          background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.35) 48%, rgba(255,255,255,0.05) 52%, transparent 65%);
          animation: liquidSheen 9s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes waveDrift {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .wave-layer {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          animation: waveDrift linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .wave-layer, .liquid-sheen::before { animation: none; }
        }
      `}</style>

      {/* Animated sea-wave backdrop, fixed behind all sections */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#0B3D2A]" />
        <svg
          className="wave-layer"
          style={{ height: '38vh', minHeight: 220, animationDuration: '26s', opacity: 0.55 }}
          viewBox="0 0 2400 300"
          preserveAspectRatio="none"
        >
          <path
            fill="#12522F"
            d="M0,150 C200,220 400,80 600,150 C800,220 1000,80 1200,150 C1400,220 1600,80 1800,150 C2000,220 2200,80 2400,150 L2400,300 L0,300 Z M2400,150 C2600,220 2800,80 3000,150 C3200,220 3400,80 3600,150 C3800,220 4000,80 4200,150 C4400,220 4600,80 4800,150 L4800,300 L2400,300 Z"
          />
        </svg>
        <svg
          className="wave-layer"
          style={{ height: '30vh', minHeight: 180, animationDuration: '18s', animationDirection: 'reverse', opacity: 0.7 }}
          viewBox="0 0 2400 300"
          preserveAspectRatio="none"
        >
          <path
            fill="#1C6B3C"
            d="M0,180 C150,120 350,220 600,170 C850,120 1050,220 1300,170 C1550,120 1750,220 2000,170 C2150,140 2300,180 2400,170 L2400,300 L0,300 Z M2400,170 C2550,120 2750,220 3000,170 C3250,120 3450,220 3700,170 C3950,120 4150,220 4400,170 C4550,140 4700,180 4800,170 L4800,300 L2400,300 Z"
          />
        </svg>
        <svg
          className="wave-layer"
          style={{ height: '20vh', minHeight: 120, animationDuration: '12s', opacity: 0.9 }}
          viewBox="0 0 2400 300"
          preserveAspectRatio="none"
        >
          <path
            fill="#2A7F4C"
            d="M0,200 C200,240 400,160 600,200 C800,240 1000,160 1200,200 C1400,240 1600,160 1800,200 C2000,240 2200,160 2400,200 L2400,300 L0,300 Z M2400,200 C2600,240 2800,160 3000,200 C3200,240 3400,160 3600,200 C3800,240 4000,160 4200,200 C4400,240 4600,160 4800,200 L4800,300 L2400,300 Z"
          />
        </svg>
      </div>

      {/* Liquid Glass Floating Navbar */}
      <header className="sticky top-4 sm:top-6 z-40 px-4 sm:px-6">
        <div
          className="liquid-sheen relative max-w-6xl mx-auto h-16 sm:h-[68px] px-3 sm:px-4 flex items-center justify-between rounded-full overflow-hidden
          bg-[rgba(15,74,49,0.45)] backdrop-blur-2xl backdrop-saturate-[1.8]
          border border-[rgba(246,239,221,0.25)]
          shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.25)]
          transition-all duration-300"
        >

          <a href="https://hhgoa.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group relative z-10 pl-1">
            <span className="font-pixel bg-[#F2C14E] text-black px-2 py-1 text-[10px] sm:text-xs leading-none rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.25)] group-hover:-rotate-3 transition-transform duration-200">
              2:47PM
            </span>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display font-semibold text-[#F6EFDD] tracking-tight text-sm uppercase">
                Hacker House Goa
              </span>
              <span className="text-[9px] text-[#F2C14E] tracking-[0.2em] font-['Space_Mono'] uppercase">
                2026 Edition
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-[11px] tracking-widest font-bold uppercase text-[rgba(246,239,221,0.85)] relative z-10">
            <a href="#generator" className="hover:text-[#F2C14E] transition-colors duration-200">Builder ID</a>
            <a href="#framed-in-goa" className="hover:text-[#FF3E8E] transition-colors duration-200">#FrameInGoa</a>
            <a href="#how-it-works" className="hover:text-[#F2C14E] transition-colors duration-200">How It Works</a>
            <a href="https://hhgoa.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#F2C14E] transition-colors duration-200 flex items-center gap-1">
              HH Goa <ArrowUpRight className="w-3 h-3 text-[#F2C14E]" />
            </a>
          </nav>

          {/* Liquid Glass CTA pill */}
          <a
            href="https://hhgoa.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 bg-[#F2C14E] hover:bg-[#F6EFDD] text-black font-extrabold uppercase text-[11px] tracking-widest px-5 py-2.5 rounded-full transition-all duration-300 shadow-[0_2px_10px_rgba(242,193,78,0.35),inset_0_1px_0_rgba(255,255,255,0.6)] hover:shadow-[0_4px_18px_rgba(242,193,78,0.55)] hover:scale-[1.03]"
          >
            Apply
          </a>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 bg-[#0F4A31]/95 border-b border-[#1C6B3C] pt-16 md:pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 border border-[#2A7F4C] bg-[#093825] px-3 py-1.5 text-[11px] uppercase tracking-widest text-[#F2C14E] rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-['Space_Mono']">BUILDER CREDENTIAL GENERATOR</span>
              </div>

              <h1 className="font-display text-6xl sm:text-8xl lg:text-[9.5rem] font-black uppercase tracking-tight leading-[0.82] text-[#F6EFDD] drop-shadow-[0_6px_0_rgba(0,0,0,0.35)]">
                BUILD<br />
                YOUR{' '}
                <span className="relative inline-block align-middle mx-1">
                  <span
                    className="absolute inset-0 -rotate-6 bg-[#FF3E8E] rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.3)]"
                    style={{ transform: 'rotate(-7deg) scale(1.15, 1.3)' }}
                  />
                  <span className="relative text-white px-3">ID</span>
                </span>
                <br />
                <span className="text-[#F2C14E]">HH GOA</span>
              </h1>
            </div>

            <div className="lg:col-span-4 space-y-6 border-l-0 lg:border-l border-[#2A7F4C] lg:pl-8">
              <div className="space-y-1">
                <p className="text-[#F2C14E] text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                  GOA, INDIA
                  <span className="font-display text-base normal-case tracking-normal text-[rgba(246,239,221,0.6)]">· गोवा</span>
                </p>
                <p className="text-2xl font-black text-[#F6EFDD] font-display uppercase">28 — 31 OCT 2026</p>
                <p className="text-xs text-[rgba(246,239,221,0.6)]">4 DAYS OF INTENSIVE BUILDING &amp; CULTURE</p>
              </div>

              <p className="text-xs text-[rgba(246,239,221,0.8)] leading-relaxed">
                Create your Hacker House Goa 2026 Builder Passport. Share your identity pass across X with <span className="text-[#F2C14E] font-mono">#FrameInGoa</span> to join the community build movement.
              </p>

              <div className="pt-2">
                <a 
                  href="#generator" 
                  className="inline-flex items-center gap-2 bg-[#F2C14E] hover:bg-white text-black font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(242,193,78,0.2)] hover:shadow-[0_0_30px_rgba(242,193,78,0.5)]"
                >
                  <Zap className="w-4 h-4 fill-current" /> CLAIM YOUR PASSPORT
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Studio / Generator */}
      <section id="generator" className="bg-[#093825]/96 py-20 relative z-10 border-b border-[#12522F]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="mb-12 space-y-2">
            <span className="text-[#F2C14E] text-xs font-bold tracking-widest uppercase">// PASSPORT STUDIO</span>
            <h2 className="text-4xl sm:text-6xl font-black uppercase text-[#F6EFDD] font-display">
              GENERATE YOUR BUILDER ID
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Controls */}
            <div className="lg:col-span-6 space-y-10">
              
              {/* Step 01 */}
              <div className="space-y-4 pt-4 border-t-2 border-[#F2C14E]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F2C14E] tracking-widest uppercase flex items-center gap-2">
                    01 / YOUR PHOTO
                  </span>
                  {image && (
                    <button
                      onClick={handleReset}
                      type="button"
                      className="text-[10px] text-[rgba(246,239,221,0.5)] hover:text-[#F6EFDD] transition-colors flex items-center gap-1 uppercase tracking-wider"
                    >
                      <RotateCcw className="w-3 h-3" /> CLEAR PHOTO
                    </button>
                  )}
                </div>

                {!image ? (
                  <div>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`border-2 border-dashed bg-[#0F4A31] p-8 text-center cursor-pointer transition-all duration-300 group rounded-2xl ${
                        uploadError ? 'border-[#FF3E8E]' : 'border-[#2A7F4C] hover:border-[#F2C14E]'
                      }`}
                      role="button"
                      aria-label="Upload Avatar Image"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#093825] border border-[#2A7F4C] group-hover:border-[#F2C14E] flex items-center justify-center mx-auto text-[#F2C14E] transition-colors duration-200 mb-3">
                        <Upload className="w-5 h-5 stroke-[1.5]" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#F6EFDD]">
                        SELECT PORTRAIT PHOTO
                      </p>
                      <p className="text-[10px] text-[rgba(246,239,221,0.5)] mt-1 uppercase tracking-widest">
                        JPG, PNG, WEBP, GIF, HEIC, AVIF, BMP, TIFF, SVG — MAX 10MB
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/avif,image/heic,image/heif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff,.avif,.heic,.heif,.svg"
                        className="hidden"
                      />
                    </div>
                    {uploadError && (
                      <p className="mt-3 text-[11px] text-[#FF3E8E] font-bold tracking-wide flex items-start gap-1.5">
                        <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {uploadError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 border border-[#2A7F4C] p-4 bg-[#0F4A31] rounded-2xl">
                    <div className="relative aspect-square max-w-[260px] mx-auto bg-black border border-white/10 rounded-full overflow-hidden">
                      <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] tracking-widest uppercase text-[rgba(246,239,221,0.7)]">
                          <span>ZOOM</span>
                          <span className="text-[#F2C14E]">{zoom.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="2"
                          step="0.1"
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="w-full accent-[#F2C14E] bg-black/40 h-1 rounded-full appearance-none cursor-pointer"
                          aria-label="Zoom Avatar"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] tracking-widest uppercase text-[rgba(246,239,221,0.7)]">
                          <span>ROTATE</span>
                          <span className="text-[#F2C14E]">{rotation}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="90"
                          value={rotation}
                          onChange={(e) => setRotation(parseInt(e.target.value))}
                          className="w-full accent-[#F2C14E] bg-black/40 h-1 rounded-full appearance-none cursor-pointer"
                          aria-label="Rotate Avatar"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 02 */}
              <div className="space-y-6 pt-4 border-t-2 border-[#F2C14E]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F2C14E] tracking-widest uppercase">
                    02 / YOUR IDENTITY
                  </span>
                  <span className="text-[10px] text-[#F2C14E]/70 font-mono tracking-widest uppercase">
                    SYSTEM ID: {builderId}
                  </span>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-[10px] uppercase tracking-widest text-[rgba(246,239,221,0.7)] font-bold">
                        FIRST NAME
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={builderData.firstName}
                        onChange={handleInputChange}
                        placeholder="Aarav"
                        className="w-full bg-[#0F4A31] border-b border-[#2A7F4C] focus:border-[#F2C14E] px-3 py-2 text-[#F6EFDD] text-xs tracking-wider placeholder-[rgba(246,239,221,0.2)] focus:outline-none transition-colors duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-[10px] uppercase tracking-widest text-[rgba(246,239,221,0.7)] font-bold">
                        LAST NAME
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={builderData.lastName}
                        onChange={handleInputChange}
                        placeholder="Sharma"
                        className="w-full bg-[#0F4A31] border-b border-[#2A7F4C] focus:border-[#F2C14E] px-3 py-2 text-[#F6EFDD] text-xs tracking-wider placeholder-[rgba(246,239,221,0.2)] focus:outline-none transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="role" className="block text-[10px] uppercase tracking-widest text-[rgba(246,239,221,0.7)] font-bold">
                        ROLE / DISCIPLINE
                      </label>
                      <input
                        type="text"
                        id="role"
                        name="role"
                        value={builderData.role}
                        onChange={handleInputChange}
                        placeholder="Full-Stack Developer"
                        className="w-full bg-[#0F4A31] border-b border-[#2A7F4C] focus:border-[#F2C14E] px-3 py-2 text-[#F6EFDD] text-xs tracking-wider placeholder-[rgba(246,239,221,0.2)] focus:outline-none transition-colors duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="location" className="block text-[10px] uppercase tracking-widest text-[rgba(246,239,221,0.7)] font-bold">
                        LOCATION
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={builderData.location}
                        onChange={handleInputChange}
                        placeholder="Goa, India"
                        className="w-full bg-[#0F4A31] border-b border-[#2A7F4C] focus:border-[#F2C14E] px-3 py-2 text-[#F6EFDD] text-xs tracking-wider placeholder-[rgba(246,239,221,0.2)] focus:outline-none transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="archetype" className="block text-[10px] uppercase tracking-widest text-[rgba(246,239,221,0.7)] font-bold">
                      BUILDER CLASS
                    </label>
                    <input
                      type="text"
                      id="archetype"
                      name="archetype"
                      value={builderData.archetype}
                      onChange={handleInputChange}
                      placeholder="System Architect"
                      className="w-full bg-[#0F4A31] border-b border-[#2A7F4C] focus:border-[#F2C14E] px-3 py-2 text-[#F6EFDD] text-xs tracking-wider placeholder-[rgba(246,239,221,0.2)] focus:outline-none transition-colors duration-200"
                    />
                  </div>
                </form>
              </div>

              {/* Step 03 */}
              <div className="space-y-4 pt-4 border-t-2 border-[#F2C14E]">
                <span className="text-xs font-bold text-[#F2C14E] tracking-widest uppercase block">
                  03 / YOUR TECH STACK
                </span>
                <div className="space-y-2">
                  <label htmlFor="techStack" className="block text-[10px] uppercase tracking-widest text-[rgba(246,239,221,0.7)] font-bold">
                    PRIMARY STACK <span className="text-[rgba(246,239,221,0.3)]">(COMMA SEPARATED)</span>
                  </label>
                  <input
                    type="text"
                    id="techStack"
                    name="techStack"
                    value={builderData.techStack}
                    onChange={handleInputChange}
                    placeholder="React, Node.js, TypeScript, Rust"
                    className="w-full bg-[#0F4A31] border-b border-[#2A7F4C] focus:border-[#F2C14E] px-3 py-2 text-[#F6EFDD] text-xs tracking-wider placeholder-[rgba(246,239,221,0.2)] focus:outline-none transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Button System */}
              <div className="pt-6 border-t border-[#2A7F4C] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Primary CTA */}
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    type="button"
                    className="bg-[#F2C14E] hover:bg-white text-black font-extrabold uppercase tracking-wider py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-[0_0_20px_rgba(242,193,78,0.2)] hover:shadow-[0_0_30px_rgba(242,193,78,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> GENERATING...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> GENERATE MY HH GOA ID
                      </>
                    )}
                  </button>

                  {/* Secondary Glass CTA */}
                  <button
                    onClick={handleShareOnX}
                    type="button"
                    className="bg-[rgba(0,36,13,0.5)] border border-[#F2C14E] text-[#F2C14E] hover:bg-[#F2C14E] hover:text-black font-bold uppercase tracking-wider py-4 px-6 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-[0_0_15px_rgba(242,193,78,0.1)] hover:shadow-[0_0_25px_rgba(242,193,78,0.4)]"
                  >
                    <Share2 className="w-4 h-4" /> SHARE ON X
                  </button>
                </div>
                <p className="text-[10px] text-[rgba(246,239,221,0.4)] tracking-wider">
                  Generates a high-resolution 1080 × 1080 PNG builder credential.
                </p>
              </div>

            </div>

            {/* Right Passport Hero Elevation */}
            <div className="lg:col-span-6 lg:sticky lg:top-28 space-y-4">
              <div className="flex items-center justify-between text-xs tracking-widest text-[#F2C14E] uppercase font-bold border-b border-[#2A7F4C] pb-2">
                <span>PASSPORT PREVIEW</span>
                <span className="text-[rgba(246,239,221,0.4)] font-mono">1080 x 1080 PX</span>
              </div>

              <div
                ref={tiltRef}
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
                className="relative"
                style={{ perspective: '1200px' }}
              >
                <div
                  className="relative transition-transform duration-150 ease-out will-change-transform"
                  style={{
                    transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.rx || tilt.ry ? 1.015 : 1})`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <BuilderPassportCard
                    ref={cardRef}
                    photo={croppedImage}
                    firstName={builderData.firstName}
                    lastName={builderData.lastName}
                    role={builderData.role}
                    location={builderData.location}
                    archetype={builderData.archetype}
                    techStack={builderData.techStack}
                    builderId={builderId}
                    builderNumber={builderNumber}
                  />
                  {/* Corner light reacting to cursor position, like a foil/holographic ID.
                      Rounded to match the card's own 32px corner exactly (no mismatched clip). */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[32px] transition-opacity duration-150"
                    style={{
                      opacity: tilt.rx || tilt.ry ? 1 : 0,
                      background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.35), rgba(242,193,78,0.12) 30%, transparent 60%)`,
                      mixBlendMode: 'overlay',
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[rgba(246,239,221,0.4)] uppercase tracking-widest pt-2">
                <span>HACKER HOUSE GOA 2026</span>
                <span>REAL-TIME CARD RENDER</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* #FrameInGoa Campaign Section */}
      <section id="framed-in-goa" className="bg-[#0F4A31]/95 py-20 relative z-10 border-b border-[#1C6B3C]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-8 space-y-6">
              <span className="inline-block bg-[#FF3E8E] text-white text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full -rotate-2 shadow-[0_3px_0_rgba(0,0,0,0.25)]">
                #FrameInGoa
              </span>
              <h2 className="text-5xl sm:text-7xl font-black uppercase text-[#F6EFDD] font-display leading-none">
                BUILD YOUR ID.<br />
                MAKE IT YOURS.<br />
                <span className="text-[#F2C14E]">SHARE IT.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[rgba(246,239,221,0.72)] max-w-xl leading-relaxed font-['Space_Mono']">
                Create your Hacker House Goa Builder ID, download your passport, and share your build identity with the community. Tag your post with <span className="text-[#FF3E8E] font-bold">#FrameInGoa</span> on X.
              </p>
            </div>

            <div className="lg:col-span-4 bg-[#093825] border border-[#2A7F4C] p-8 space-y-6 text-center">
              <div className="text-xs font-bold text-[#F2C14E] tracking-widest uppercase">
                JOIN THE MOVEMENT
              </div>
              <div className="text-3xl font-black text-[#F6EFDD] font-display uppercase">
                SHARE YOUR PASS
              </div>
              <button
                onClick={handleShareOnX}
                type="button"
                className="w-full bg-[#F2C14E] hover:bg-white text-black font-extrabold uppercase tracking-wider py-4 px-6 rounded-full text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(242,193,78,0.2)] hover:shadow-[0_0_30px_rgba(242,193,78,0.5)]"
              >
                <Share2 className="w-4 h-4" /> SHARE ON X NOW
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-[#0B3D2A]/95 py-20 relative z-10 border-b border-[#12522F]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="mb-12">
            <span className="text-[#F2C14E] text-xs font-bold tracking-widest uppercase">// WORKFLOW</span>
            <h2 className="text-4xl sm:text-6xl font-black uppercase text-[#F6EFDD] font-display mt-1">
              HOW IT WORKS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-[#0F4A31] border border-[#2A7F4C] p-8 space-y-4">
              <span className="text-3xl font-black text-[#F2C14E] font-display">01</span>
              <h3 className="text-lg font-bold text-[#F6EFDD] uppercase font-display">UPLOAD PORTRAIT</h3>
              <p className="text-xs text-[rgba(246,239,221,0.6)] leading-relaxed">
                Upload your profile image. Scale and position your avatar inside our built-in cropper tool.
              </p>
            </div>

            <div className="bg-[#0F4A31] border border-[#2A7F4C] p-8 space-y-4">
              <span className="text-3xl font-black text-[#F2C14E] font-display">02</span>
              <h3 className="text-lg font-bold text-[#F6EFDD] uppercase font-display">BUILD IDENTITY</h3>
              <p className="text-xs text-[rgba(246,239,221,0.6)] leading-relaxed">
                Fill in your role, location, builder class, and tech stack. The passport renders instantly in real time.
              </p>
            </div>

            <div className="bg-[#0F4A31] border border-[#2A7F4C] p-8 space-y-4">
              <span className="text-3xl font-black text-[#F2C14E] font-display">03</span>
              <h3 className="text-lg font-bold text-[#F6EFDD] uppercase font-display">EXPORT &amp; SHARE</h3>
              <p className="text-xs text-[rgba(246,239,221,0.6)] leading-relaxed">
                Download your high-resolution 1080 × 1080 PNG passport and post on X with #FrameInGoa.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/95 py-16 text-xs text-[rgba(246,239,221,0.5)] tracking-widest uppercase relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#F6EFDD] font-bold text-sm">
              <span className="bg-[#12522F] text-[#F2C14E] px-2 py-0.5 font-black">HH</span>
              <span>HACKER HOUSE GOA 2026</span>
            </div>
            <p className="text-[10px] text-[rgba(246,239,221,0.4)]">
              GOA, INDIA // 28 — 31 OCT 2026 // #FrameInGoa
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-[11px] font-bold">
            <a 
              href="https://hhgoa.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#F2C14E] transition-colors duration-200 flex items-center gap-1 text-[#F6EFDD]"
            >
              HHGOA.COM <ArrowUpRight className="w-3.5 h-3.5 text-[#F2C14E]" />
            </a>
            <a href="#generator" className="hover:text-[#F2C14E] transition-colors duration-200">BUILDER ID</a>
            <a href="#framed-in-goa" className="hover:text-[#F2C14E] transition-colors duration-200">#FrameInGoa</a>
            <a 
              href="https://hhgoa.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[rgba(0,36,13,0.5)] border border-[#F2C14E] text-[#F2C14E] hover:bg-[#F2C14E] hover:text-black px-4 py-2 rounded-full font-extrabold backdrop-blur-md transition-all duration-300"
            >
              APPLY NOW
            </a>
          </div>

        </div>
      </footer>

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm bg-[#093825] border-2 border-[#F2C14E] p-8 text-center space-y-6 shadow-[0_0_40px_rgba(242,193,78,0.2)]">
            
            <button
              onClick={() => setShowSuccessModal(false)}
              type="button"
              className="absolute top-4 right-4 text-[rgba(246,239,221,0.5)] hover:text-[#F6EFDD] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-[#0F4A31] border border-[#F2C14E] text-[#F2C14E] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-lg font-black uppercase text-[#F6EFDD] font-display tracking-wider">
                PASSPORT ISSUED!
              </h3>
              <p className="text-xs text-[rgba(246,239,221,0.7)]">
                Your builder passport has been created successfully.
              </p>
            </div>

            <div className="space-y-3 uppercase tracking-wider text-xs">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  handleDownload();
                }}
                type="button"
                className="w-full bg-[#F2C14E] hover:bg-white text-black font-extrabold py-3.5 px-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(242,193,78,0.3)]"
              >
                <Download className="w-4 h-4" /> DOWNLOAD AGAIN
              </button>

              <button
                onClick={handleShareOnX}
                type="button"
                className="w-full bg-[rgba(0,36,13,0.5)] border border-[#F2C14E] text-[#F2C14E] hover:bg-[#F2C14E] hover:text-black font-bold py-3.5 px-4 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> SHARE ON X
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
