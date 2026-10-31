import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Video, 
  Upload, 
  Camera, 
  Sparkles, 
  Music, 
  Hash, 
  Check, 
  Play, 
  Pause, 
  RefreshCw,
  Coins,
  ShieldCheck,
  Disc
} from 'lucide-react';
import { BlueTixaVideo } from '../../types/blueTixa';
import { blueTixaVideoEngine } from '../../core/blueTixaVideoEngine';
import { POPULAR_AUDIO_TRACKS, TRENDING_HASHTAGS } from '../../data/blueTixaSeedData';
import { authEngine } from '../../core/authEngine';
import confetti from 'canvas-confetti';

interface BlueTixaCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (video: BlueTixaVideo) => void;
}

export const BlueTixaCreateModal: React.FC<BlueTixaCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [creationMode, setCreationMode] = useState<'upload' | 'record'>('upload');
  const [caption, setCaption] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(['#TIXAPAY', '#Web3']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedAudio, setSelectedAudio] = useState(POPULAR_AUDIO_TRACKS[0]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [monetizationEnabled, setMonetizationEnabled] = useState(true);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRecordRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const session = authEngine.getSession();

  // Stop camera when closing
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
    }
  }, [isOpen]);

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
  };

  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true
      });
      setCameraStream(stream);
      if (videoRecordRef.current) {
        videoRecordRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError('Camera access not available in this browser session. You can upload a video file instead.');
    }
  };

  const handleStartRecording = () => {
    if (!cameraStream) return;
    recordedChunksRef.current = [];
    try {
      const mediaRecorder = new MediaRecorder(cameraStream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setVideoPreviewUrl(url);
        stopCameraStream();
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => {
          if (s >= 60) {
            handleStopRecording();
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Failed to start media recorder', err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const handleToggleHashtag = (tag: string) => {
    if (selectedHashtags.includes(tag)) {
      setSelectedHashtags(selectedHashtags.filter(t => t !== tag));
    } else {
      setSelectedHashtags([...selectedHashtags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const clean = customTagInput.startsWith('#') ? customTagInput.trim() : `#${customTagInput.trim()}`;
      if (!selectedHashtags.includes(clean)) {
        setSelectedHashtags([...selectedHashtags, clean]);
      }
      setCustomTagInput('');
    }
  };

  const handlePublish = async (isDraft: boolean = false) => {
    if (!caption.trim()) {
      alert('Please enter a caption for your short video');
      return;
    }

    setIsPublishing(true);

    // Default fallback video URL if recording was simulated or standard clip
    const finalVideoUrl = videoPreviewUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    const thumbnail = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80';

    const userName = session?.email ? session.email.split('@')[0] : 'TIXA Pioneer';
    const creatorInfo = {
      id: session?.walletAddress || 'CURRENT_USER',
      name: userName,
      handle: session ? `@${userName.toLowerCase()}` : '@pioneer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      address: session?.walletAddress || 'TXA1111222233334444555566667777888899990000'
    };

    const newVideo = blueTixaVideoEngine.uploadVideo({
      caption: caption.trim(),
      hashtags: selectedHashtags,
      videoUrl: finalVideoUrl,
      thumbnailUrl: thumbnail,
      audioTitle: selectedAudio.title,
      audioArtist: selectedAudio.artist,
      duration: recordingSeconds > 0 ? recordingSeconds : 18,
      creator: creatorInfo,
      isDraft
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setIsPublishing(false);
    onSuccess(newVideo);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#060b18] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#081026]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Video className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono tracking-wide">BLUE TIXA Creator Studio</h3>
              <p className="text-[10px] text-cyan-400 font-mono">Create & Publish Short-Form Video</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setCreationMode('upload');
                stopCameraStream();
              }}
              className={`py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition ${
                creationMode === 'upload'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Video</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreationMode('record');
                handleStartCamera();
              }}
              className={`py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition ${
                creationMode === 'record'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Record with Camera</span>
            </button>
          </div>

          {/* Media Capture / Upload Area */}
          {creationMode === 'upload' ? (
            <div>
              {videoPreviewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-black aspect-[9/10] max-h-64 mx-auto flex items-center justify-center">
                  <video 
                    src={videoPreviewUrl} 
                    controls 
                    className="w-full h-full object-cover" 
                  />
                  <button
                    onClick={() => {
                      setVideoPreviewUrl(null);
                      setVideoFile(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 hover:bg-cyan-950/20 transition group">
                  <input 
                    type="file" 
                    accept="video/mp4,video/webm,video/quicktime,video/*" 
                    onChange={handleFileUpload}
                    className="hidden" 
                  />
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition mb-3">
                    <Upload className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-white mb-1">Choose short video file to upload</span>
                  <span className="text-xs text-slate-400 font-mono">MP4, WebM, MOV (Max 60s, up to 100MB)</span>
                </label>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {cameraError ? (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs">
                  {cameraError}
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-black aspect-[9/10] max-h-72 mx-auto flex items-center justify-center">
                  {videoPreviewUrl ? (
                    <video src={videoPreviewUrl} controls className="w-full h-full object-cover" />
                  ) : (
                    <video ref={videoRecordRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  )}

                  {/* Recording HUD */}
                  {isRecording && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-mono font-bold flex items-center gap-2 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      REC {recordingSeconds}s / 60s
                    </div>
                  )}

                  {/* Camera Controls Overlay */}
                  {!videoPreviewUrl && (
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.5)]"
                        >
                          <span className="w-3 h-3 rounded-full bg-white" />
                          Start Recording
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStopRecording}
                          className="px-6 py-2.5 rounded-full bg-slate-900 border border-rose-500 text-rose-400 font-bold text-xs font-mono flex items-center gap-2"
                        >
                          <Pause className="w-3 h-3" />
                          Stop & Save
                        </button>
                      )}
                    </div>
                  )}

                  {videoPreviewUrl && (
                    <button
                      onClick={() => {
                        setVideoPreviewUrl(null);
                        handleStartCamera();
                      }}
                      className="absolute top-2 right-2 px-3 py-1 rounded-xl bg-black/80 text-cyan-300 hover:text-white text-xs font-mono flex items-center gap-1 border border-cyan-500/40"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retake
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Caption Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
              <span>Caption & Description</span>
              <span className="text-[10px] text-slate-500">{caption.length}/200</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={200}
              placeholder="Describe your video, trading alpha, mainnet insights or crypto update..."
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Hashtags Section */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trending Hashtags</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TRENDING_HASHTAGS.map(t => {
                const isSelected = selectedHashtags.includes(t.tag);
                return (
                  <button
                    key={t.tag}
                    type="button"
                    onClick={() => handleToggleHashtag(t.tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{t.tag}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder="Type custom #tag and press Enter..."
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          {/* Soundtrack Audio Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Background Audio (Legally Cleared)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POPULAR_AUDIO_TRACKS.map(track => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setSelectedAudio(track)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    selectedAudio.id === track.id
                      ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Disc className={`w-4 h-4 shrink-0 ${selectedAudio.id === track.id ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{track.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{track.artist}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Creator Monetization Toggle */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Coins className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white font-mono">Creator Monetization & Rewards</div>
                <div className="text-[10px] text-slate-400">Earn 200 Points ($2.00 USD) per 1,000 verified eligible views</div>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={monetizationEnabled} 
              onChange={(e) => setMonetizationEnabled(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 cursor-pointer" 
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#081026] border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handlePublish(true)}
            disabled={isPublishing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition"
          >
            Save as Draft
          </button>
          
          <button
            type="button"
            onClick={() => handlePublish(false)}
            disabled={isPublishing || !caption.trim()}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold font-mono text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-40 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>{isPublishing ? 'Minting & Publishing...' : 'Publish to BLUE TIXA'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
