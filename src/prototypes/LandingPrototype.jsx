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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setCroppedAreaPixels(null);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
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

  const handleShareOnX = async () => {
    const tweetText = `Just claimed my Builder Identity for Hacker House Goa 2026 🚀\n\nBuilt with #FramedInGoa\n#HHGoa`;

    if (canShareFiles && cardRef.current) {
      try {
        const blob = await svgToPngBlob(cardRef.current, 2);
        const file = new File([blob], 'hhgoa-builder-pass.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            text: tweetText,
            title: 'HH Goa Builder Pass',
          });
          return;
        }
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }

    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#001c0a] text-[#F5F5E8] font-mono selection:bg-[#ccff00] selection:text-black antialiased relative overflow-x-hidden">
      
      {/* Glassmorphism Header */}
      <header className="sticky top-0 z-40 bg-[rgba(0,28,10,0.65)] backdrop-blur-[16px] border-b border-[rgba(204,255,0,0.18)] shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
          
          <a href="https://hhgoa.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <span className="bg-[#00290e] border border-[rgba(204,255,0,0.3)] group-hover:border-[#ccff00] text-[#ccff00] font-black px-2.5 py-1 text-sm tracking-tight transition-all duration-200">
              HH
            </span>
            <div className="flex flex-col">
              <span className="font-black text-[#F5F5E8] tracking-widest text-xs sm:text-sm font-sans uppercase">
                HACKER HOUSE GOA
              </span>
              <span className="text-[10px] text-[#ccff00] tracking-widest font-mono">
                2026 EDITION
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest font-bold uppercase text-[rgba(245,245,232,0.8)]">
            <a href="#generator" className="hover:text-[#ccff00] transition-colors duration-200">BUILDER ID</a>
            <a href="#framed-in-goa" className="hover:text-[#ccff00] transition-colors duration-200">#FramedInGoa</a>
            <a href="#how-it-works" className="hover:text-[#ccff00] transition-colors duration-200">HOW IT WORKS</a>
            <a href="https://hhgoa.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#ccff00] transition-colors duration-200 flex items-center gap-1">
              HH GOA <ArrowUpRight className="w-3 h-3 text-[#ccff00]" />
            </a>
          </nav>

          {/* Premium Glass CTA */}
          <a 
            href="https://hhgoa.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[rgba(0,36,13,0.5)] border border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-extrabold uppercase text-xs tracking-widest px-5 py-2.5 backdrop-blur-md transition-all duration-300 shadow-[0_0_15px_rgba(204,255,0,0.1)] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]"
          >
            APPLY
          </a>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 bg-[#00240d] border-b border-[#004a1b] pt-16 md:pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 border border-[#005e22] bg-[#001708] px-3 py-1.5 text-[11px] uppercase tracking-widest text-[#ccff00]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BUILDER CREDENTIAL GENERATOR</span>
              </div>

              <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.86] text-[#F5F5E8] font-sans">
                BUILD<br />
                YOUR<br />
                <span className="text-[#ccff00]">HH GOA ID</span>
              </h1>
            </div>

            <div className="lg:col-span-4 space-y-6 border-l-0 lg:border-l border-[#005e22] lg:pl-8">
              <div className="space-y-1">
                <p className="text-[#ccff00] text-sm font-bold tracking-widest uppercase">GOA, INDIA</p>
                <p className="text-2xl font-black text-[#F5F5E8] font-sans uppercase">28 — 31 OCT 2026</p>
                <p className="text-xs text-[rgba(245,245,232,0.6)]">4 DAYS OF INTENSIVE BUILDING &amp; CULTURE</p>
              </div>

              <p className="text-xs text-[rgba(245,245,232,0.8)] leading-relaxed font-sans">
                Create your Hacker House Goa 2026 Builder Passport. Share your identity pass across X with <span className="text-[#ccff00] font-mono">#FramedInGoa</span> to join the community build movement.
              </p>

              <div className="pt-2">
                <a 
                  href="#generator" 
                  className="inline-flex items-center gap-2 bg-[#ccff00] hover:bg-white text-black font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 transition-all duration-300 shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)]"
                >
                  <Zap className="w-4 h-4 fill-current" /> CLAIM YOUR PASSPORT
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Studio / Generator */}
      <section id="generator" className="bg-[#001708] py-20 relative z-10 border-b border-[#003814]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="mb-12 space-y-2">
            <span className="text-[#ccff00] text-xs font-bold tracking-widest uppercase">// PASSPORT STUDIO</span>
            <h2 className="text-4xl sm:text-6xl font-black uppercase text-[#F5F5E8] font-sans">
              GENERATE YOUR BUILDER ID
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Controls */}
            <div className="lg:col-span-6 space-y-10">
              
              {/* Step 01 */}
              <div className="space-y-4 pt-4 border-t-2 border-[#ccff00]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#ccff00] tracking-widest uppercase flex items-center gap-2">
                    01 / YOUR PHOTO
                  </span>
                  {image && (
                    <button
                      onClick={handleReset}
                      type="button"
                      className="text-[10px] text-[rgba(245,245,232,0.5)] hover:text-[#F5F5E8] transition-colors flex items-center gap-1 uppercase tracking-wider"
                    >
                      <RotateCcw className="w-3 h-3" /> CLEAR PHOTO
                    </button>
                  )}
                </div>

                {!image ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    className="border-2 border-dashed border-[#005e22] hover:border-[#ccff00] bg-[#00240d] p-8 text-center cursor-pointer transition-all duration-300 group"
                    role="button"
                    aria-label="Upload Avatar Image"
                  >
                    <div className="w-12 h-12 bg-[#001708] border border-[#005e22] group-hover:border-[#ccff00] flex items-center justify-center mx-auto text-[#ccff00] transition-colors duration-200 mb-3">
                      <Upload className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#F5F5E8]">
                      SELECT PORTRAIT PHOTO
                    </p>
                    <p className="text-[10px] text-[rgba(245,245,232,0.5)] mt-1 uppercase tracking-widest">
                      PNG, JPG, OR WEBP — MAX 5MB
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4 border border-[#005e22] p-4 bg-[#00240d]">
                    <div className="relative aspect-square max-w-[260px] mx-auto bg-black border border-white/10">
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
                        <div className="flex justify-between text-[10px] tracking-widest uppercase text-[rgba(245,245,232,0.7)]">
                          <span>ZOOM</span>
                          <span className="text-[#ccff00]">{zoom.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="2"
                          step="0.1"
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="w-full accent-[#ccff00] bg-black/40 h-1 appearance-none cursor-pointer"
                          aria-label="Zoom Avatar"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] tracking-widest uppercase text-[rgba(245,245,232,0.7)]">
                          <span>ROTATE</span>
                          <span className="text-[#ccff00]">{rotation}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="90"
                          value={rotation}
                          onChange={(e) => setRotation(parseInt(e.target.value))}
                          className="w-full accent-[#ccff00] bg-black/40 h-1 appearance-none cursor-pointer"
                          aria-label="Rotate Avatar"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 02 */}
              <div className="space-y-6 pt-4 border-t-2 border-[#ccff00]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#ccff00] tracking-widest uppercase">
                    02 / YOUR IDENTITY
                  </span>
                  <span className="text-[10px] text-[#ccff00]/70 font-mono tracking-widest uppercase">
                    SYSTEM ID: {builderId}
                  </span>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-[10px] uppercase tracking-widest text-[rgba(245,245,232,0.7)] font-bold">
                        FIRST NAME
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={builderData.firstName}
                        onChange={handleInputChange}
                        placeholder="Aarav"
                        className="w-full bg-[#00240d] border-b border-[#005e22] focus:border-[#ccff00] px-3 py-2 text-[#F5F5E8] text-xs tracking-wider placeholder-[rgba(245,245,232,0.2)] focus:outline-none transition-colors duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-[10px] uppercase tracking-widest text-[rgba(245,245,232,0.7)] font-bold">
                        LAST NAME
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={builderData.lastName}
                        onChange={handleInputChange}
                        placeholder="Sharma"
                        className="w-full bg-[#00240d] border-b border-[#005e22] focus:border-[#ccff00] px-3 py-2 text-[#F5F5E8] text-xs tracking-wider placeholder-[rgba(245,245,232,0.2)] focus:outline-none transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="role" className="block text-[10px] uppercase tracking-widest text-[rgba(245,245,232,0.7)] font-bold">
                        ROLE / DISCIPLINE
                      </label>
                      <input
                        type="text"
                        id="role"
                        name="role"
                        value={builderData.role}
                        onChange={handleInputChange}
                        placeholder="Full-Stack Developer"
                        className="w-full bg-[#00240d] border-b border-[#005e22] focus:border-[#ccff00] px-3 py-2 text-[#F5F5E8] text-xs tracking-wider placeholder-[rgba(245,245,232,0.2)] focus:outline-none transition-colors duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="location" className="block text-[10px] uppercase tracking-widest text-[rgba(245,245,232,0.7)] font-bold">
                        LOCATION
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={builderData.location}
                        onChange={handleInputChange}
                        placeholder="Goa, India"
                        className="w-full bg-[#00240d] border-b border-[#005e22] focus:border-[#ccff00] px-3 py-2 text-[#F5F5E8] text-xs tracking-wider placeholder-[rgba(245,245,232,0.2)] focus:outline-none transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="archetype" className="block text-[10px] uppercase tracking-widest text-[rgba(245,245,232,0.7)] font-bold">
                      BUILDER CLASS
                    </label>
                    <input
                      type="text"
                      id="archetype"
                      name="archetype"
                      value={builderData.archetype}
                      onChange={handleInputChange}
                      placeholder="System Architect"
                      className="w-full bg-[#00240d] border-b border-[#005e22] focus:border-[#ccff00] px-3 py-2 text-[#F5F5E8] text-xs tracking-wider placeholder-[rgba(245,245,232,0.2)] focus:outline-none transition-colors duration-200"
                    />
                  </div>
                </form>
              </div>

              {/* Step 03 */}
              <div className="space-y-4 pt-4 border-t-2 border-[#ccff00]">
                <span className="text-xs font-bold text-[#ccff00] tracking-widest uppercase block">
                  03 / YOUR TECH STACK
                </span>
                <div className="space-y-2">
                  <label htmlFor="techStack" className="block text-[10px] uppercase tracking-widest text-[rgba(245,245,232,0.7)] font-bold">
                    PRIMARY STACK <span className="text-[rgba(245,245,232,0.3)]">(COMMA SEPARATED)</span>
                  </label>
                  <input
                    type="text"
                    id="techStack"
                    name="techStack"
                    value={builderData.techStack}
                    onChange={handleInputChange}
                    placeholder="React, Node.js, TypeScript, Rust"
                    className="w-full bg-[#00240d] border-b border-[#005e22] focus:border-[#ccff00] px-3 py-2 text-[#F5F5E8] text-xs tracking-wider placeholder-[rgba(245,245,232,0.2)] focus:outline-none transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Button System */}
              <div className="pt-6 border-t border-[#005e22] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Primary CTA */}
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    type="button"
                    className="bg-[#ccff00] hover:bg-white text-black font-extrabold uppercase tracking-wider py-4 px-6 transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="bg-[rgba(0,36,13,0.5)] border border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-bold uppercase tracking-wider py-4 px-6 backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-[0_0_15px_rgba(204,255,0,0.1)] hover:shadow-[0_0_25px_rgba(204,255,0,0.4)]"
                  >
                    <Share2 className="w-4 h-4" /> SHARE ON X
                  </button>
                </div>
                <p className="text-[10px] text-[rgba(245,245,232,0.4)] tracking-wider">
                  Generates a high-resolution 1080 × 1080 PNG builder credential.
                </p>
              </div>

            </div>

            {/* Right Passport Hero Elevation */}
            <div className="lg:col-span-6 lg:sticky lg:top-28 space-y-4">
              <div className="flex items-center justify-between text-xs tracking-widest text-[#ccff00] uppercase font-bold border-b border-[#005e22] pb-2">
                <span>PASSPORT PREVIEW</span>
                <span className="text-[rgba(245,245,232,0.4)] font-mono">1080 x 1080 PX</span>
              </div>

              <div className="relative shadow-[0_0_40px_rgba(204,255,0,0.08)] transition-all duration-300">
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
              </div>

              <div className="flex items-center justify-between text-[10px] text-[rgba(245,245,232,0.4)] uppercase tracking-widest pt-2">
                <span>HACKER HOUSE GOA 2026</span>
                <span>REAL-TIME CARD RENDER</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* #FramedInGoa Campaign Section */}
      <section id="framed-in-goa" className="bg-[#00240d] py-20 relative z-10 border-b border-[#004a1b]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-8 space-y-6">
              <span className="text-[#ccff00] text-xs font-bold tracking-widest uppercase">
                #FramedInGoa
              </span>
              <h2 className="text-5xl sm:text-7xl font-black uppercase text-[#F5F5E8] font-sans leading-none">
                BUILD YOUR ID.<br />
                MAKE IT YOURS.<br />
                <span className="text-[#ccff00]">SHARE IT.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[rgba(245,245,232,0.72)] max-w-xl font-sans leading-relaxed">
                Create your Hacker House Goa Builder ID, download your passport, and share your build identity with the community. Tag your post with <span className="text-[#ccff00] font-mono">#FramedInGoa</span> on X.
              </p>
            </div>

            <div className="lg:col-span-4 bg-[#001708] border border-[#005e22] p-8 space-y-6 text-center">
              <div className="text-xs font-bold text-[#ccff00] tracking-widest uppercase">
                JOIN THE MOVEMENT
              </div>
              <div className="text-3xl font-black text-[#F5F5E8] font-sans uppercase">
                SHARE YOUR PASS
              </div>
              <button
                onClick={handleShareOnX}
                type="button"
                className="w-full bg-[#ccff00] hover:bg-white text-black font-extrabold uppercase tracking-wider py-4 px-6 text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)]"
              >
                <Share2 className="w-4 h-4" /> SHARE ON X NOW
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-[#001c0a] py-20 relative z-10 border-b border-[#003814]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="mb-12">
            <span className="text-[#ccff00] text-xs font-bold tracking-widest uppercase">// WORKFLOW</span>
            <h2 className="text-4xl sm:text-6xl font-black uppercase text-[#F5F5E8] font-sans mt-1">
              HOW IT WORKS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-[#00240d] border border-[#005e22] p-8 space-y-4">
              <span className="text-3xl font-black text-[#ccff00] font-sans">01</span>
              <h3 className="text-lg font-bold text-[#F5F5E8] uppercase font-sans">UPLOAD PORTRAIT</h3>
              <p className="text-xs text-[rgba(245,245,232,0.6)] leading-relaxed font-sans">
                Upload your profile image. Scale and position your avatar inside our built-in cropper tool.
              </p>
            </div>

            <div className="bg-[#00240d] border border-[#005e22] p-8 space-y-4">
              <span className="text-3xl font-black text-[#ccff00] font-sans">02</span>
              <h3 className="text-lg font-bold text-[#F5F5E8] uppercase font-sans">BUILD IDENTITY</h3>
              <p className="text-xs text-[rgba(245,245,232,0.6)] leading-relaxed font-sans">
                Fill in your role, location, builder class, and tech stack. The passport renders instantly in real time.
              </p>
            </div>

            <div className="bg-[#00240d] border border-[#005e22] p-8 space-y-4">
              <span className="text-3xl font-black text-[#ccff00] font-sans">03</span>
              <h3 className="text-lg font-bold text-[#F5F5E8] uppercase font-sans">EXPORT &amp; SHARE</h3>
              <p className="text-xs text-[rgba(245,245,232,0.6)] leading-relaxed font-sans">
                Download your high-resolution 1080 × 1080 PNG passport and post on X with #FramedInGoa.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-16 text-xs text-[rgba(245,245,232,0.5)] tracking-widest uppercase relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#F5F5E8] font-bold text-sm">
              <span className="bg-[#003814] text-[#ccff00] px-2 py-0.5 font-black">HH</span>
              <span>HACKER HOUSE GOA 2026</span>
            </div>
            <p className="text-[10px] text-[rgba(245,245,232,0.4)]">
              GOA, INDIA // 28 — 31 OCT 2026 // #FramedInGoa
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-[11px] font-bold">
            <a 
              href="https://hhgoa.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#ccff00] transition-colors duration-200 flex items-center gap-1 text-[#F5F5E8]"
            >
              HHGOA.COM <ArrowUpRight className="w-3.5 h-3.5 text-[#ccff00]" />
            </a>
            <a href="#generator" className="hover:text-[#ccff00] transition-colors duration-200">BUILDER ID</a>
            <a href="#framed-in-goa" className="hover:text-[#ccff00] transition-colors duration-200">#FramedInGoa</a>
            <a 
              href="https://hhgoa.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[rgba(0,36,13,0.5)] border border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black px-4 py-2 font-extrabold backdrop-blur-md transition-all duration-300"
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
          <div className="relative w-full max-w-sm bg-[#001708] border-2 border-[#ccff00] p-8 text-center space-y-6 shadow-[0_0_40px_rgba(204,255,0,0.2)]">
            
            <button
              onClick={() => setShowSuccessModal(false)}
              type="button"
              className="absolute top-4 right-4 text-[rgba(245,245,232,0.5)] hover:text-[#F5F5E8] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-[#00240d] border border-[#ccff00] text-[#ccff00] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-lg font-black uppercase text-[#F5F5E8] font-sans tracking-wider">
                PASSPORT ISSUED!
              </h3>
              <p className="text-xs text-[rgba(245,245,232,0.7)]">
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
                className="w-full bg-[#ccff00] hover:bg-white text-black font-extrabold py-3.5 px-4 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)]"
              >
                <Download className="w-4 h-4" /> DOWNLOAD AGAIN
              </button>

              <button
                onClick={handleShareOnX}
                type="button"
                className="w-full bg-[rgba(0,36,13,0.5)] border border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-bold py-3.5 px-4 backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2"
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