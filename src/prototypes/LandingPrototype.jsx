import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Share2, 
  Check, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Code2, 
  MapPin, 
  User, 
  Briefcase, 
  Layers,
  X,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';

export default function LandingPrototype() {
  // Image Upload & Processing State
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Unique Builder ID generated once on initial load
  const [builderId] = useState(() => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `HHG-2026-${randomDigits}`;
  });

  // Editable Builder Identity state
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

  // Handle keyboard modal dismissal (Escape)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && showSuccessModal) {
      setShowSuccessModal(false);
    }
  }, [showSuccessModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBuilderData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setCroppedImage(event.target.result);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setImage(null);
    setCroppedImage(null);
    setZoom(1);
    setRotation(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Real Export via html2canvas
  const handleDownload = async () => {
    if (!cardRef.current || isProcessing) return;
    setIsProcessing(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const firstName = builderData.firstName.trim() || 'builder';
      const lastName = builderData.lastName.trim() || 'pass';
      const filename = `HHGOA-${firstName}-${lastName}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Failed to generate image download:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Share Intent on X
  const handleShareOnX = () => {
    const tweetText = `Just claimed my Builder Identity for Hacker House Goa 2026 🚀\n\nBuilt with #FrameInGoa\n#HHGoa`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const techStackList = builderData.techStack
    .split(',')
    .map((tech) => tech.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#080b0e] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      
      {/* Precision Ambient Grid Background */}
      <div 
        className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" 
        aria-hidden="true"
      />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#080b0e]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm shadow-inner">
              HH
            </div>
            <span className="font-mono font-semibold text-slate-100 tracking-wider text-xs sm:text-sm flex items-center">
              HACKER HOUSE GOA <span className="text-emerald-400/80 font-normal ml-2 text-xs">// 2026</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              BUILDER CARD GENERATOR
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Controls & Editable Form */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header Text */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5 font-mono">
                <Terminal className="w-6 h-6 text-emerald-400 shrink-0" />
                Claim Your Passport
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Upload your avatar, adjust controls, and edit profile details below to customize your Hacker House Goa builder card in real time.
              </p>
            </div>

            {/* Avatar Upload Panel */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  01. Avatar Upload
                </span>
                {image && (
                  <button
                    onClick={handleReset}
                    type="button"
                    className="text-xs font-mono text-slate-400 hover:text-slate-100 transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
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
                  className="border border-dashed border-slate-700/80 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-slate-900/80 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                  role="button"
                  aria-label="Upload Avatar Image"
                >
                  <div className="w-11 h-11 rounded-full bg-slate-800/80 group-hover:bg-emerald-500/10 flex items-center justify-center mx-auto text-slate-400 group-hover:text-emerald-400 transition-colors mb-3 border border-white/5">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-200 font-sans">
                    Click or drag photo to upload
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-sans">
                    PNG, JPG or WEBP up to 5MB
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
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center shadow-inner">
                    <img
                      src={croppedImage}
                      alt="Avatar Preview"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      }}
                      className="max-h-full object-contain transition-transform duration-100 ease-out"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Zoom</span>
                        <span className="text-emerald-400">{zoom.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer focus-visible:outline-none"
                        aria-label="Zoom Avatar"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Rotate</span>
                        <span className="text-emerald-400">{rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="90"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer focus-visible:outline-none"
                        aria-label="Rotate Avatar"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Builder Identity Form */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
              <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  02. Builder Identity
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                  LIVE UPDATING
                </span>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="block text-xs font-medium text-slate-300 font-mono">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={builderData.firstName}
                      onChange={handleInputChange}
                      placeholder="e.g. Aarav"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="block text-xs font-medium text-slate-300 font-mono">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={builderData.lastName}
                      onChange={handleInputChange}
                      placeholder="e.g. Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Role */}
                  <div className="space-y-1.5">
                    <label htmlFor="role" className="block text-xs font-medium text-slate-300 font-mono">
                      Builder Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={builderData.role}
                      onChange={handleInputChange}
                      placeholder="e.g. Full-Stack Developer"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label htmlFor="location" className="block text-xs font-medium text-slate-300 font-mono">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={builderData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Goa, India"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Archetype */}
                <div className="space-y-1.5">
                  <label htmlFor="archetype" className="block text-xs font-medium text-slate-300 font-mono">
                    Archetype
                  </label>
                  <input
                    type="text"
                    id="archetype"
                    name="archetype"
                    value={builderData.archetype}
                    onChange={handleInputChange}
                    placeholder="e.g. System Architect"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                  />
                </div>

                {/* Tech Stack */}
                <div className="space-y-1.5">
                  <label htmlFor="techStack" className="block text-xs font-medium text-slate-300 font-mono">
                    Tech Stack <span className="text-slate-500 text-[10px]">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    id="techStack"
                    name="techStack"
                    value={builderData.techStack}
                    onChange={handleInputChange}
                    placeholder="e.g. React, Node.js, Rust"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                  />
                </div>
              </form>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={handleDownload}
                disabled={isProcessing}
                type="button"
                className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-mono font-bold py-3.5 px-5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating Pass...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download Card Pass
                  </>
                )}
              </button>
              <button
                onClick={handleShareOnX}
                type="button"
                className="bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-200 font-mono font-semibold py-3.5 px-5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              >
                <Share2 className="w-4 h-4" /> Share on X
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Builder Card Preview */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                <span className="uppercase tracking-wider flex items-center gap-2 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Card Live Preview
                </span>
                <span className="text-[11px] text-slate-500">FORMAT: ID-CARD-V2</span>
              </div>

              {/* BUILDER CARD TARGET */}
              <div
                ref={cardRef}
                className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 p-6 sm:p-8 shadow-2xl transition-all duration-300"
              >
                {/* Subtle Gradient Layers */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Visual Dot Matrix Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Card Top Header */}
                <div className="relative z-10 flex justify-between items-start border-b border-white/10 pb-5">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono tracking-wider uppercase">
                      <Zap className="w-3 h-3" />
                      {builderData.archetype || 'Builder Archetype'}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      ID: {builderId}
                    </p>
                  </div>
                  
                  {/* Ultra-Realistic Passport Stamp */}
                  <div className="relative border-2 border-dashed border-emerald-500/50 rounded-lg px-2.5 py-1.5 transform rotate-6 bg-slate-950/80 shadow-md flex flex-col items-center justify-center text-center select-none">
                    <div className="absolute -inset-0.5 border border-emerald-500/20 rounded-lg pointer-events-none" />
                    <span className="text-[9px] font-mono font-bold text-emerald-400 tracking-widest uppercase leading-none">
                      VERIFIED
                    </span>
                    <span className="text-[11px] font-mono font-black text-white tracking-tight my-0.5">
                      GOA '26
                    </span>
                    <div className="flex items-center gap-1 text-[8px] font-mono text-emerald-400/90">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>PASSPORT</span>
                    </div>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="relative z-10 py-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  {/* Avatar Container */}
                  <div className="relative group mx-auto sm:mx-0 shrink-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500/30 flex items-center justify-center relative shadow-xl">
                      {croppedImage ? (
                        <img
                          src={croppedImage}
                          alt="Builder Avatar"
                          style={{
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                          }}
                          className="w-full h-full object-cover transition-transform duration-100 ease-out"
                        />
                      ) : (
                        <div className="text-center p-3">
                          <User className="w-10 h-10 text-slate-700 mx-auto mb-1" />
                          <span className="text-[10px] text-slate-500 font-mono block">NO AVATAR</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-400 text-slate-950 p-1.5 rounded-lg shadow-lg border border-slate-950">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-3 flex-1 text-center sm:text-left min-w-0 w-full">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                        {builderData.firstName || builderData.lastName
                          ? `${builderData.firstName} ${builderData.lastName}`.trim()
                          : 'Anonymous Builder'}
                      </h2>
                      <p className="text-emerald-400 text-xs sm:text-sm font-semibold font-mono mt-1 flex items-center justify-center sm:justify-start gap-1.5 truncate">
                        <Briefcase className="w-3.5 h-3.5 shrink-0" />
                        {builderData.role || 'Builder Role'}
                      </p>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{builderData.location || 'Remote'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Tech Stack Footer */}
                <div className="relative z-10 border-t border-white/10 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-emerald-400" />
                      Primary Stack
                    </span>
                    <span className="text-slate-500">{techStackList.length} TAGS</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {techStackList.length > 0 ? (
                      techStackList.map((tech, idx) => (
                        <span
                          key={`${tech}-${idx}`}
                          className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-900 text-emerald-300 border border-emerald-500/20"
                        >
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 font-mono italic">No stack specified</span>
                    )}
                  </div>
                </div>

                {/* Pass Sub-Footer */}
                <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>HACKER HOUSE GOA</span>
                  <span>BUILDER PASS v2.0</span>
                </div>
              </div>

              {/* Notice */}
              <p className="text-[11px] text-slate-500 text-center font-mono">
                Changes in the form reflect instantly on your generated builder pass above.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 text-center font-sans">
            
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <h3 id="modal-title" className="text-lg font-bold text-white font-mono tracking-tight">
                ✅ Passport Issued
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Your Builder Identity has been generated.
              </p>
            </div>

            {/* Action Group */}
            <div className="space-y-2.5 font-mono text-xs">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  handleDownload();
                }}
                type="button"
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <Download className="w-4 h-4" /> Download Again
              </button>

              <button
                onClick={handleShareOnX}
                type="button"
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-3 px-4 rounded-xl border border-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              >
                <Share2 className="w-4 h-4 text-emerald-400" /> Share on X
              </button>

              <button
                onClick={() => setShowSuccessModal(false)}
                type="button"
                className="w-full bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 font-medium py-3 px-4 rounded-xl border border-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700"
              >
                <User className="w-4 h-4" /> Edit Identity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}