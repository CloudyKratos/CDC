export interface DeviceFingerprint {
  userAgent: string;
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  canvasFingerprint: string;
  audioFingerprint: string;
  webglFingerprint: string;
  hash: string;
}

export interface SecurityContext {
  userId: string;
  deviceFingerprint: DeviceFingerprint;
  sessionId: string;
  ipAddress: string;
  location?: string;
  lastActivity: number;
  riskScore: number;
  authenticationLevel: 'basic' | 'mfa' | 'biometric';
}

export interface ThreatDetection {
  threatType: 'brute_force' | 'anomalous_behavior' | 'device_change' | 'location_change' | 'malware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  userId: string;
  blocked: boolean;
}

export class ZeroTrustSecurityService {
  private static instance: ZeroTrustSecurityService;
  private securityContexts: Map<string, SecurityContext> = new Map();
  private deviceFingerprints: Map<string, DeviceFingerprint> = new Map();
  private threatDetections: ThreatDetection[] = [];
  private behaviorBaselines: Map<string, any> = new Map();
  private securityPolicies: Map<string, any> = new Map();
  private auditLog: any[] = [];

  static getInstance(): ZeroTrustSecurityService {
    if (!ZeroTrustSecurityService.instance) {
      ZeroTrustSecurityService.instance = new ZeroTrustSecurityService();
    }
    return ZeroTrustSecurityService.instance;
  }

  async initialize(): Promise<void> {
    // Initialize security policies
    this.initializeSecurityPolicies();
    
    // Start continuous monitoring
    this.startContinuousMonitoring();
    
    console.log('Zero-Trust Security Service initialized');
  }

  private initializeSecurityPolicies(): void {
    // Device trust policy
    this.securityPolicies.set('device-trust', {
      maxDevicesPerUser: 5,
      deviceTrustExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
      requireReauthOnNewDevice: true
    });

    // Location policy
    this.securityPolicies.set('location', {
      maxLocationChangesPerDay: 3,
      suspiciousCountries: ['XX', 'YY'], // Country codes
      requireMFAOnLocationChange: true
    });

    // Behavior analysis policy
    this.securityPolicies.set('behavior', {
      typingPatternAnalysis: true,
      mouseMovementAnalysis: true,
      sessionTimeoutMinutes: 60,
      maxFailedAttempts: 3
    });
  }

  async createSecurityContext(userId: string): Promise<SecurityContext> {
    const deviceFingerprint = await this.generateDeviceFingerprint();
    const ipAddress = await this.getClientIPAddress();
    
    const context: SecurityContext = {
      userId,
      deviceFingerprint,
      sessionId: this.generateSessionId(),
      ipAddress,
      lastActivity: Date.now(),
      riskScore: 0,
      authenticationLevel: 'basic'
    };

    // Calculate initial risk score
    context.riskScore = await this.calculateRiskScore(context);
    
    this.securityContexts.set(userId, context);
    this.deviceFingerprints.set(deviceFingerprint.hash, deviceFingerprint);
    
    this.auditLog.push({
      action: 'security_context_created',
      userId,
      timestamp: Date.now(),
      riskScore: context.riskScore
    });

    return context;
  }

  private async generateDeviceFingerprint(): Promise<DeviceFingerprint> {
    const userAgent = navigator.userAgent;
    const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const platform = navigator.platform;
    
    const canvasFingerprint = await this.generateCanvasFingerprint();
    const audioFingerprint = await this.generateAudioFingerprint();
    const webglFingerprint = await this.generateWebGLFingerprint();
    
    const combinedString = `${userAgent}|${screen}|${timezone}|${language}|${platform}|${canvasFingerprint}|${audioFingerprint}|${webglFingerprint}`;
    const hash = await this.hashString(combinedString);

    return {
      userAgent,
      screen,
      timezone,
      language,
      platform,
      canvasFingerprint,
      audioFingerprint,
      webglFingerprint,
      hash
    };
  }

  private async generateCanvasFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    canvas.width = 200;
    canvas.height = 50;
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Device fingerprinting', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Security validation', 4, 45);

    return canvas.toDataURL();
  }

  private async generateAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(0);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      const data = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(data);
      
      audioContext.close();
      
      return Array.from(data.slice(0, 100)).join(',');
    } catch (error) {
      return 'no-audio';
    }
  }

  private async generateWebGLFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';

      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      const version = gl.getParameter(gl.VERSION);
      const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);

      return `${renderer}|${vendor}|${version}|${shadingLanguageVersion}`;
    } catch (error) {
      return 'no-webgl';
    }
  }

  private async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getClientIPAddress(): Promise<string> {
    try {
      // This would typically be provided by the server
      // For client-side, we'll use a placeholder
      return 'client-ip-placeholder';
    } catch (error) {
      return 'unknown';
    }
  }

  private async calculateRiskScore(context: SecurityContext): Promise<number> {
    let riskScore = 0;

    // Check device fingerprint against known devices
    const knownDevice = this.deviceFingerprints.has(context.deviceFingerprint.hash);
    if (!knownDevice) {
      riskScore += 30; // New device adds risk
    }

    // Check for suspicious patterns
    const recentThreats = this.threatDetections.filter(
      threat => threat.userId === context.userId && 
      Date.now() - threat.timestamp < 24 * 60 * 60 * 1000
    );
    riskScore += recentThreats.length * 10;

    // Time-based risk (unusual login times)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 15; // Outside normal hours
    }

    return Math.min(100, riskScore);
  }

  async validateAccess(userId: string, resource: string): Promise<boolean> {
    const context = this.securityContexts.get(userId);
    if (!context) {
      this.logThreat({
        threatType: 'anomalous_behavior',
        severity: 'high',
        description: 'Access attempt without valid security context',
        timestamp: Date.now(),
        userId,
        blocked: true
      });
      return false;
    }

    // Update last activity
    context.lastActivity = Date.now();

    // Check risk score
    if (context.riskScore > 70) {
      this.logThreat({
        threatType: 'anomalous_behavior',
        severity: 'high',
        description: `High risk score access attempt: ${context.riskScore}`,
        timestamp: Date.now(),
        userId,
        blocked: true
      });
      return false;
    }

    // Check session timeout
    const sessionTimeout = 60 * 60 * 1000; // 1 hour
    if (Date.now() - context.lastActivity > sessionTimeout) {
      this.logThreat({
        threatType: 'anomalous_behavior',
        severity: 'medium',
        description: 'Session timeout exceeded',
        timestamp: Date.now(),
        userId,
        blocked: true
      });
      return false;
    }

    this.auditLog.push({
      action: 'access_granted',
      userId,
      resource,
      timestamp: Date.now(),
      riskScore: context.riskScore
    });

    return true;
  }

  private logThreat(threat: ThreatDetection): void {
    this.threatDetections.push(threat);
    
    // Keep only last 1000 threats
    if (this.threatDetections.length > 1000) {
      this.threatDetections.shift();
    }

    console.warn(`Security Threat Detected: ${threat.threatType} - ${threat.description}`);
    
    // Auto-block critical threats
    if (threat.severity === 'critical') {
      this.blockUser(threat.userId, threat.description);
    }
  }

  private blockUser(userId: string, reason: string): void {
    const context = this.securityContexts.get(userId);
    if (context) {
      context.riskScore = 100; // Maximum risk
      this.auditLog.push({
        action: 'user_blocked',
        userId,
        reason,
        timestamp: Date.now()
      });
    }
  }

  private startContinuousMonitoring(): void {
    // Monitor for behavioral anomalies
    setInterval(() => {
      this.analyzeBehaviorPatterns();
    }, 30000); // Every 30 seconds

    // Clean up old data
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000); // Every hour
  }

  private analyzeBehaviorPatterns(): void {
    this.securityContexts.forEach((context, userId) => {
      // Check for rapid successive actions
      const recentActivity = Date.now() - context.lastActivity;
      if (recentActivity < 1000) { // Less than 1 second
        this.logThreat({
          threatType: 'anomalous_behavior',
          severity: 'medium',
          description: 'Rapid successive actions detected',
          timestamp: Date.now(),
          userId,
          blocked: false
        });
      }
    });
  }

  private cleanupOldData(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    // Clean old threats
    this.threatDetections = this.threatDetections.filter(
      threat => threat.timestamp > oneDayAgo
    );

    // Clean old audit logs
    this.auditLog = this.auditLog.filter(
      log => log.timestamp > oneDayAgo
    );
  }

  getSecurityContext(userId: string): SecurityContext | null {
    return this.securityContexts.get(userId) || null;
  }

  getThreatDetections(userId?: string): ThreatDetection[] {
    if (userId) {
      return this.threatDetections.filter(threat => threat.userId === userId);
    }
    return [...this.threatDetections];
  }

  getAuditLog(userId?: string): any[] {
    if (userId) {
      return this.auditLog.filter(log => log.userId === userId);
    }
    return [...this.auditLog];
  }

  cleanup(): void {
    this.securityContexts.clear();
    this.deviceFingerprints.clear();
    this.threatDetections = [];
    this.behaviorBaselines.clear();
    this.auditLog = [];
    
    console.log('Zero-Trust Security Service cleaned up');
  }
}

export default ZeroTrustSecurityService.getInstance();
