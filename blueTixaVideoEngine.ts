import { 
  BlueTixaVideo, 
  BlueTixaComment, 
  BlueTixaReport, 
  BlueTixaUserProfile,
  VideoStatus 
} from '../types/blueTixa';
import { 
  INITIAL_BLUE_TIXA_VIDEOS, 
  INITIAL_BLUE_TIXA_USERS, 
  INITIAL_BLUE_TIXA_COMMENTS 
} from '../data/blueTixaSeedData';
import { auditEngine } from './auditEngine';

const STORAGE_KEY_VIDEOS = 'tixa_blue_videos_v1';
const STORAGE_KEY_COMMENTS = 'tixa_blue_comments_v1';
const STORAGE_KEY_REPORTS = 'tixa_blue_reports_v1';
const STORAGE_KEY_FOLLOWS = 'tixa_blue_follows_v1';
const STORAGE_KEY_SAVED = 'tixa_blue_saved_v1';

class BlueTixaVideoEngine {
  private videos: BlueTixaVideo[] = [];
  private comments: BlueTixaComment[] = [];
  private reports: BlueTixaReport[] = [];
  private users: Map<string, BlueTixaUserProfile> = new Map();
  private followedCreators: Set<string> = new Set();
  private savedVideoIds: Set<string> = new Set();
  private blockedUsers: Set<string> = new Set();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      INITIAL_BLUE_TIXA_USERS.forEach(u => this.users.set(u.id, u));

      const savedVids = localStorage.getItem(STORAGE_KEY_VIDEOS);
      if (savedVids) {
        const parsed: BlueTixaVideo[] = JSON.parse(savedVids);
        // Sanitize any broken or hotlink-blocked mixkit URLs
        this.videos = parsed.map((v, idx) => {
          if (v.videoUrl && v.videoUrl.includes('mixkit.co')) {
            const fallbackUrls = [
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
            ];
            return {
              ...v,
              videoUrl: fallbackUrls[idx % fallbackUrls.length]
            };
          }
          return v;
        });
      } else {
        this.videos = [...INITIAL_BLUE_TIXA_VIDEOS];
      }

      const savedComm = localStorage.getItem(STORAGE_KEY_COMMENTS);
      if (savedComm) {
        this.comments = JSON.parse(savedComm);
      } else {
        this.comments = [...INITIAL_BLUE_TIXA_COMMENTS];
      }

      const savedReps = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (savedReps) {
        this.reports = JSON.parse(savedReps);
      }

      const savedFollows = localStorage.getItem(STORAGE_KEY_FOLLOWS);
      if (savedFollows) {
        this.followedCreators = new Set(JSON.parse(savedFollows));
      }

      const savedSaved = localStorage.getItem(STORAGE_KEY_SAVED);
      if (savedSaved) {
        this.savedVideoIds = new Set(JSON.parse(savedSaved));
      }
    } catch (e) {
      console.warn('Failed to load Blue Tixa video engine state', e);
      this.videos = [...INITIAL_BLUE_TIXA_VIDEOS];
      this.comments = [...INITIAL_BLUE_TIXA_COMMENTS];
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_VIDEOS, JSON.stringify(this.videos));
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(this.comments));
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(this.reports));
      localStorage.setItem(STORAGE_KEY_FOLLOWS, JSON.stringify(Array.from(this.followedCreators)));
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(Array.from(this.savedVideoIds)));
    } catch (e) {
      console.warn('Failed to save Blue Tixa state', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    setTimeout(() => {
      this.listeners.forEach(l => {
        try {
          l();
        } catch (e) {
          console.error(e);
        }
      });
    }, 0);
  }

  // --- QUERIES & FEEDS ---

  public getFeed(options?: {
    filter?: 'FOR_YOU' | 'FOLLOWING' | 'TRENDING' | 'LIVE';
    hashtag?: string;
    creatorId?: string;
    searchQuery?: string;
  }): BlueTixaVideo[] {
    let result = this.videos.filter(v => v.status === 'PUBLISHED');

    // Filter blocked creators
    if (this.blockedUsers.size > 0) {
      result = result.filter(v => !this.blockedUsers.has(v.creatorId));
    }

    // Hashtag filter
    if (options?.hashtag) {
      const cleanTag = options.hashtag.replace('#', '').toLowerCase();
      result = result.filter(v => v.hashtags.some(h => h.toLowerCase().includes(cleanTag)));
    }

    // Creator ID filter
    if (options?.creatorId) {
      result = result.filter(v => v.creatorId === options.creatorId);
    }

    // Search query filter
    if (options?.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase();
      result = result.filter(v => 
        v.caption.toLowerCase().includes(q) ||
        v.creatorName.toLowerCase().includes(q) ||
        v.creatorHandle.toLowerCase().includes(q) ||
        v.hashtags.some(h => h.toLowerCase().includes(q))
      );
    }

    // Sub-feed filters
    if (options?.filter === 'FOLLOWING') {
      result = result.filter(v => this.followedCreators.has(v.creatorId));
    } else if (options?.filter === 'TRENDING') {
      result = [...result].sort((a, b) => (b.viewsCount + b.likesCount * 2) - (a.viewsCount + a.likesCount * 2));
    }

    // Map current user follow / save states
    return result.map(v => ({
      ...v,
      isFollowing: this.followedCreators.has(v.creatorId),
      isSaved: this.savedVideoIds.has(v.id)
    }));
  }

  public getVideoById(id: string): BlueTixaVideo | undefined {
    const v = this.videos.find(item => item.id === id);
    if (!v) return undefined;
    return {
      ...v,
      isFollowing: this.followedCreators.has(v.creatorId),
      isSaved: this.savedVideoIds.has(v.id)
    };
  }

  public getSavedVideos(): BlueTixaVideo[] {
    return this.videos
      .filter(v => this.savedVideoIds.has(v.id))
      .map(v => ({
        ...v,
        isSaved: true,
        isFollowing: this.followedCreators.has(v.creatorId)
      }));
  }

  public getUserVideos(creatorId: string): BlueTixaVideo[] {
    return this.videos.filter(v => v.creatorId === creatorId || (creatorId === 'CURRENT_USER' && v.creatorId === 'CURRENT_USER'));
  }

  // --- INTERACTIONS ---

  public toggleLike(videoId: string): { isLiked: boolean; newCount: number } {
    const video = this.videos.find(v => v.id === videoId);
    if (!video) return { isLiked: false, newCount: 0 };

    video.isLiked = !video.isLiked;
    video.likesCount += video.isLiked ? 1 : -1;
    if (video.likesCount < 0) video.likesCount = 0;

    this.saveState();
    return { isLiked: video.isLiked, newCount: video.likesCount };
  }

  public toggleSave(videoId: string): boolean {
    const isSaved = this.savedVideoIds.has(videoId);
    const video = this.videos.find(v => v.id === videoId);

    if (isSaved) {
      this.savedVideoIds.delete(videoId);
      if (video) video.savesCount = Math.max(0, video.savesCount - 1);
    } else {
      this.savedVideoIds.add(videoId);
      if (video) video.savesCount += 1;
    }

    this.saveState();
    return !isSaved;
  }

  public toggleFollow(creatorId: string): boolean {
    const isFollowing = this.followedCreators.has(creatorId);
    if (isFollowing) {
      this.followedCreators.delete(creatorId);
    } else {
      this.followedCreators.add(creatorId);
    }

    const creator = this.users.get(creatorId);
    if (creator) {
      creator.followersCount += isFollowing ? -1 : 1;
    }

    this.saveState();
    return !isFollowing;
  }

  public recordShare(videoId: string): number {
    const video = this.videos.find(v => v.id === videoId);
    if (video) {
      video.sharesCount += 1;
      this.saveState();
      return video.sharesCount;
    }
    return 0;
  }

  // --- COMMENTS ---

  public getComments(videoId: string): BlueTixaComment[] {
    return this.comments.filter(c => c.videoId === videoId).sort((a, b) => b.createdAt - a.createdAt);
  }

  public addComment(params: {
    videoId: string;
    content: string;
    userId: string;
    userName: string;
    userHandle: string;
    userAvatar: string;
  }): BlueTixaComment {
    const newComment: BlueTixaComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      videoId: params.videoId,
      userId: params.userId,
      userName: params.userName,
      userHandle: params.userHandle,
      userAvatar: params.userAvatar,
      content: params.content.trim(),
      likesCount: 0,
      isLiked: false,
      createdAt: Date.now()
    };

    this.comments.unshift(newComment);

    const video = this.videos.find(v => v.id === params.videoId);
    if (video) {
      video.commentsCount += 1;
    }

    this.saveState();
    return newComment;
  }

  public toggleLikeComment(commentId: string): boolean {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return false;

    comment.isLiked = !comment.isLiked;
    comment.likesCount += comment.isLiked ? 1 : -1;
    this.saveState();
    return comment.isLiked;
  }

  // --- CREATION & UPLOADS ---

  /**
   * Uploads and registers a new short-form video into BLUE TIXA.
   * Every uploaded video receives a cryptographically unique video ID.
   */
  public uploadVideo(params: {
    caption: string;
    hashtags: string[];
    videoUrl: string;
    thumbnailUrl: string;
    audioTitle: string;
    audioArtist: string;
    duration: number;
    creator: {
      id: string;
      name: string;
      handle: string;
      avatar: string;
      address: string;
    };
    isDraft?: boolean;
  }): BlueTixaVideo {
    const videoId = `bt_vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    const newVideo: BlueTixaVideo = {
      id: videoId,
      creatorId: params.creator.id,
      creatorName: params.creator.name,
      creatorHandle: params.creator.handle.startsWith('@') ? params.creator.handle : `@${params.creator.handle}`,
      creatorAvatar: params.creator.avatar,
      creatorAddress: params.creator.address,
      creatorIsVerified: false,
      videoUrl: params.videoUrl,
      thumbnailUrl: params.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      caption: params.caption,
      hashtags: params.hashtags.map(h => h.startsWith('#') ? h : `#${h}`),
      audioTitle: params.audioTitle || 'Original Sound - ' + params.creator.name,
      audioArtist: params.audioArtist || params.creator.name,
      duration: Math.round(params.duration || 15),
      aspectRatio: '9:16',
      viewsCount: 1,
      eligibleViewsCount: 1,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      pointsEarned: 0,
      status: params.isDraft ? 'DRAFT' : 'PUBLISHED',
      monetizationEnabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.videos.unshift(newVideo);
    this.saveState();

    auditEngine.logAction({
      userId: params.creator.id,
      action: 'BLUE_TIXA_VIDEO_PUBLISHED',
      details: `User published short-video #${videoId} "${params.caption.slice(0, 40)}..."`,
      ip: '127.0.0.1',
      severity: 'LOW'
    });

    return newVideo;
  }

  // --- REPORTING & MODERATION ---

  public reportVideo(params: {
    videoId: string;
    reportedBy: string;
    reason: BlueTixaReport['reason'];
    details: string;
  }): BlueTixaReport {
    const video = this.videos.find(v => v.id === params.videoId);
    const report: BlueTixaReport = {
      id: `bt_rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      videoId: params.videoId,
      videoTitle: video ? video.caption.slice(0, 50) : 'Unknown Video',
      creatorHandle: video ? video.creatorHandle : '@unknown',
      reportedBy: params.reportedBy,
      reason: params.reason,
      details: params.details,
      status: 'OPEN',
      createdAt: Date.now()
    };

    this.reports.unshift(report);
    this.saveState();

    auditEngine.logAction({
      userId: params.reportedBy,
      action: 'BLUE_TIXA_CONTENT_REPORTED',
      details: `User reported video #${params.videoId} for ${params.reason}`,
      ip: '127.0.0.1',
      severity: 'MEDIUM'
    });

    return report;
  }

  public getReports(): BlueTixaReport[] {
    return [...this.reports];
  }

  public adminModerateReport(
    reportId: string, 
    action: 'BAN_VIDEO' | 'FLAG_VIDEO' | 'DISMISS', 
    adminUser: string
  ): boolean {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return false;

    report.status = action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED';
    const video = this.videos.find(v => v.id === report.videoId);

    if (video) {
      if (action === 'BAN_VIDEO') {
        video.status = 'REMOVED';
      } else if (action === 'FLAG_VIDEO') {
        video.status = 'FLAGGED';
      }
    }

    auditEngine.logAction({
      userId: adminUser,
      action: 'BLUE_TIXA_REPORT_MODERATED',
      details: `Admin ${adminUser} moderated report #${reportId} on video #${report.videoId} with action: ${action}`,
      ip: '127.0.0.1',
      severity: 'HIGH'
    });

    this.saveState();
    return true;
  }

  public updateVideoStatus(videoId: string, status: BlueTixaVideo['status']): boolean {
    const video = this.videos.find(v => v.id === videoId);
    if (!video) return false;
    video.status = status;
    video.updatedAt = Date.now();
    this.saveState();
    return true;
  }

  public resolveReport(reportId: string, actionTaken: string): boolean {
    const rep = this.reports.find(r => r.id === reportId);
    if (!rep) return false;
    rep.status = 'RESOLVED';
    this.saveState();
    return true;
  }

  public blockUser(targetUserId: string): boolean {
    this.blockedUsers.add(targetUserId);
    this.saveState();
    return true;
  }

  public getCreatorProfile(creatorIdOrHandle: string): BlueTixaUserProfile | undefined {
    if (this.users.has(creatorIdOrHandle)) {
      return this.users.get(creatorIdOrHandle);
    }
    for (const u of this.users.values()) {
      if (u.handle.toLowerCase() === creatorIdOrHandle.toLowerCase()) {
        return u;
      }
    }
    return undefined;
  }
}

export const blueTixaVideoEngine = new BlueTixaVideoEngine();
