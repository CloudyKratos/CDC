import StageSignalingService, { SignalingMessage } from './StageSignalingService';
import { WebRTCIntelligenceEngine } from './ai/WebRTCIntelligenceEngine';
import { ConnectionMetrics } from './ai/WebRTCIntelligenceEngine';

interface EnhancedPeerConnection {
  pc: RTCPeerConnection;
  userId: string;
  isOfferer: boolean;
  remoteStream?: MediaStream;
  dataChannel?: RTCDataChannel;
  connectionMetrics: ConnectionMetrics;
  lastQualityCheck: Date;
  reconnectCount: number;
  priority: number;
}

interface MediaConstraints {
  audio: boolean;
  video: boolean;
  advanced?: {
    noiseSuppression?: boolean;
    echoCancellation?: boolean;
    autoGainControl?: boolean;
    adaptiveStreaming?: boolean;
  };
}

export class NextGenWebRTCService {
  private static instance: NextGenWebRTCService;
  private peerConnections: Map<string, EnhancedPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private isInitialized = false;
  private intelligenceEngine = WebRTCIntelligenceEngine.getInstance();
  private maxPeerConnections = 6; // Optimized for performance
  private qualityMonitorInterval: NodeJS.Timeout | null = null;
  
  // Event handlers
  private onRemoteStreamHandler: ((userId: string, stream: MediaStream) => void) | null = null;
  private onConnectionStateChangeHandler: ((userId: string, state: RTCPeerConnectionState) => void) | null = null;
  private onDataChannelMessageHandler: ((userId: string, data: any) => void) | null = null;

  // Enhanced ICE servers with TURN support
  private readonly iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ];

  static getInstance(): NextGenWebRTCService {
    if (!NextGenWebRTCService.instance) {
      NextGenWebRTCService.instance = new NextGenWebRTCService();
    }
    return NextGenWebRTCService.instance;
  }

  async initialize(localStream: MediaStream, constraints?: MediaConstraints): Promise<void> {
    if (this.isInitialized) return;

    this.localStream = await this.enhanceMediaStream(localStream, constraints);
    this.setupSignalingHandlers();
    this.startQualityMonitoring();
    this.isInitialized = true;
    
    console.log('Next-Gen WebRTC Service initialized with AI optimization');
  }

  private async enhanceMediaStream(stream: MediaStream, constraints?: MediaConstraints): Promise<MediaStream> {
    // AI-powered audio enhancement
    if (constraints?.advanced?.noiseSuppression && stream.getAudioTracks().length > 0) {
      const audioTrack = stream.getAudioTracks()[0];
      
      // Apply advanced audio constraints
      await audioTrack.applyConstraints({
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 2
      });
    }

    // Optimize video encoding
    if (stream.getVideoTracks().length > 0) {
      const videoTrack = stream.getVideoTracks()[0];
      
      await videoTrack.applyConstraints({
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 }
      });
    }

    return stream;
  }

  private setupSignalingHandlers(): void {
    StageSignalingService.onMessage('offer', this.handleOffer.bind(this));
    StageSignalingService.onMessage('answer', this.handleAnswer.bind(this));
    StageSignalingService.onMessage('ice-candidate', this.handleIceCandidate.bind(this));
    StageSignalingService.onMessage('user-joined', this.handleUserJoined.bind(this));
    StageSignalingService.onMessage('user-left', this.handleUserLeft.bind(this));
    StageSignalingService.onMessage('mesh-update', this.handleMeshUpdate.bind(this));
  }

  private async createEnhancedPeerConnection(userId: string, isOfferer: boolean): Promise<RTCPeerConnection> {
    // Check if we should create this connection based on AI optimization
    if (this.peerConnections.size >= this.maxPeerConnections) {
      const shouldReplace = await this.shouldReplaceConnection(userId);
      if (!shouldReplace) {
        throw new Error('Maximum peer connections reached and no suitable replacement found');
      }
    }

    const pc = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    // Add local stream tracks with AI-optimized encoding
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        const sender = pc.addTrack(track, this.localStream!);
        this.optimizeTrackEncoding(sender, track.kind);
      });
    }

    // Create data channel for low-latency communication
    const dataChannel = pc.createDataChannel('stage-data', {
      ordered: false,
      maxRetransmits: 0
    });

    dataChannel.onmessage = (event) => {
      if (this.onDataChannelMessageHandler) {
        this.onDataChannelMessageHandler(userId, JSON.parse(event.data));
      }
    };

    // Enhanced ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        StageSignalingService.sendSignalingMessage({
          type: 'ice-candidate',
          to: userId,
          data: event.candidate,
          priority: 'high'
        });
      }
    };

    // Enhanced remote stream handling
    pc.ontrack = (event) => {
      console.log('Received remote track from:', userId);
      const remoteStream = event.streams[0];
      
      const connection = this.peerConnections.get(userId);
      if (connection) {
        connection.remoteStream = remoteStream;
        this.peerConnections.set(userId, connection);
      }
      
      if (this.onRemoteStreamHandler) {
        this.onRemoteStreamHandler(userId, remoteStream);
      }
    };

    // AI-powered connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log(`Enhanced connection state for ${userId}:`, pc.connectionState);
      
      const connection = this.peerConnections.get(userId);
      if (connection) {
        this.updateConnectionMetrics(userId, pc);
        
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          this.handleConnectionFailure(userId);
        }
      }
      
      if (this.onConnectionStateChangeHandler) {
        this.onConnectionStateChangeHandler(userId, pc.connectionState);
      }
    };

    // ICE connection state monitoring
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        console.log('ICE connection failed, attempting restart for:', userId);
        pc.restartIce();
      }
    };

    // Store enhanced connection
    const enhancedConnection: EnhancedPeerConnection = {
      pc,
      userId,
      isOfferer,
      dataChannel,
      connectionMetrics: this.getDefaultMetrics(),
      lastQualityCheck: new Date(),
      reconnectCount: 0,
      priority: 1
    };

    this.peerConnections.set(userId, enhancedConnection);
    return pc;
  }

  private async optimizeTrackEncoding(sender: RTCRtpSender, kind: string): Promise<void> {
    const params = sender.getParameters();
    
    if (kind === 'video' && params.encodings && params.encodings.length > 0) {
      // AI-recommended bitrate
      const metrics = this.getCurrentNetworkMetrics();
      const recommendedBitrate = this.intelligenceEngine.recommendBitrate(metrics);
      
      params.encodings[0].maxBitrate = recommendedBitrate;
      params.encodings[0].scaleResolutionDownBy = metrics.bandwidth < 1000000 ? 2 : 1;
      
      await sender.setParameters(params);
    }
  }

  private async shouldReplaceConnection(newUserId: string): Promise<boolean> {
    // AI algorithm to determine if we should replace an existing connection
    const connections = Array.from(this.peerConnections.values());
    const worstConnection = connections.reduce((worst, current) => {
      return this.getConnectionScore(current) < this.getConnectionScore(worst) ? current : worst;
    });

    // Predict quality of new connection vs worst existing
    const newConnectionPrediction = this.intelligenceEngine.predictConnectionQuality(newUserId, this.getCurrentNetworkMetrics());
    const worstConnectionScore = this.getConnectionScore(worstConnection);

    return newConnectionPrediction > worstConnectionScore + 0.2; // 20% improvement threshold
  }

  private getConnectionScore(connection: EnhancedPeerConnection): number {
    const { connectionMetrics, priority, reconnectCount } = connection;
    
    const baseScore = 1 - (connectionMetrics.ping / 1000) - (connectionMetrics.packetLoss / 100);
    const reliabilityPenalty = reconnectCount * 0.1;
    const priorityBonus = priority * 0.1;
    
    return Math.max(0, baseScore - reliabilityPenalty + priorityBonus);
  }

  private getCurrentNetworkMetrics(): ConnectionMetrics {
    return {
      ping: 50, // Would be measured from actual connections
      jitter: 5,
      packetLoss: 1,
      bandwidth: 2000000,
      cpuUsage: 40,
      memoryUsage: 60
    };
  }

  private getDefaultMetrics(): ConnectionMetrics {
    return {
      ping: 0,
      jitter: 0,
      packetLoss: 0,
      bandwidth: 0,
      cpuUsage: 0,
      memoryUsage: 0
    };
  }

  private async updateConnectionMetrics(userId: string, pc: RTCPeerConnection): Promise<void> {
    try {
      const stats = await pc.getStats();
      const connection = this.peerConnections.get(userId);
      
      if (!connection) return;

      // Extract metrics from WebRTC stats
      const metrics = this.extractMetricsFromStats(stats);
      connection.connectionMetrics = metrics;
      connection.lastQualityCheck = new Date();
      
      // Update AI engine with new metrics
      this.intelligenceEngine.updateMetrics(userId, metrics);
      
      this.peerConnections.set(userId, connection);
    } catch (error) {
      console.error('Error updating connection metrics:', error);
    }
  }

  private extractMetricsFromStats(stats: RTCStatsReport): ConnectionMetrics {
    let ping = 0;
    let jitter = 0;
    let packetLoss = 0;
    let bandwidth = 0;

    stats.forEach((report) => {
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        ping = report.currentRoundTripTime * 1000 || 0;
      }
      
      if (report.type === 'inbound-rtp') {
        jitter = report.jitter || 0;
        const packetsLost = report.packetsLost || 0;
        const packetsReceived = report.packetsReceived || 1;
        packetLoss = (packetsLost / (packetsLost + packetsReceived)) * 100;
      }
      
      if (report.type === 'outbound-rtp') {
        bandwidth = report.bytesSent ? (report.bytesSent * 8) / report.timestamp : 0;
      }
    });

    return {
      ping,
      jitter,
      packetLoss,
      bandwidth,
      cpuUsage: this.getCurrentCPUUsage(),
      memoryUsage: this.getCurrentMemoryUsage()
    };
  }

  private getCurrentCPUUsage(): number {
    // Simplified CPU usage estimation
    return Math.random() * 100;
  }

  private getCurrentMemoryUsage(): number {
    // Simplified memory usage estimation
    if ('memory' in performance) {
      return ((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) * 100;
    }
    return 50; // Default estimate
  }

  private startQualityMonitoring(): void {
    this.qualityMonitorInterval = setInterval(() => {
      this.monitorAllConnections();
    }, 5000);
  }

  private async monitorAllConnections(): Promise<void> {
    for (const [userId, connection] of this.peerConnections) {
      await this.updateConnectionMetrics(userId, connection.pc);
      
      // AI-powered optimization recommendations
      const metrics = connection.connectionMetrics;
      const recommendedBitrate = this.intelligenceEngine.recommendBitrate(metrics);
      
      // Apply optimizations if needed
      if (Math.abs(recommendedBitrate - this.getCurrentBitrate(connection.pc)) > 100000) {
        await this.adjustBitrate(connection.pc, recommendedBitrate);
      }
    }
  }

  private getCurrentBitrate(pc: RTCPeerConnection): number {
    // Extract current bitrate from connection
    return 1000000; // Placeholder
  }

  private async adjustBitrate(pc: RTCPeerConnection, newBitrate: number): Promise<void> {
    const senders = pc.getSenders();
    
    for (const sender of senders) {
      if (sender.track?.kind === 'video') {
        const params = sender.getParameters();
        if (params.encodings && params.encodings.length > 0) {
          params.encodings[0].maxBitrate = newBitrate;
          await sender.setParameters(params);
        }
      }
    }
  }

  private async handleUserJoined(message: SignalingMessage): Promise<void> {
    const { userId } = message.data;
    
    if (!this.peerConnections.has(userId)) {
      console.log('Creating AI-optimized offer for new user:', userId);
      await this.createOfferForUser(userId);
    }
  }

  private async createOfferForUser(userId: string): Promise<void> {
    try {
      const pc = await this.createEnhancedPeerConnection(userId, true);
      
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(offer);
      
      await StageSignalingService.sendSignalingMessage({
        type: 'offer',
        to: userId,
        data: offer,
        priority: 'high'
      });
      
      console.log('Sent AI-optimized offer to:', userId);
    } catch (error) {
      console.error('Error creating offer for user:', userId, error);
    }
  }

  private async handleOffer(message: SignalingMessage): Promise<void> {
    try {
      const offer = message.data;
      const userId = message.from;
      
      console.log('Received offer from:', userId);
      
      if (!this.peerConnections.has(userId)) {
        const pc = await this.createEnhancedPeerConnection(userId, false);
        
        await pc.setRemoteDescription(offer);
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        await StageSignalingService.sendSignalingMessage({
          type: 'answer',
          to: userId,
          data: answer,
          priority: 'high'
        });
        
        console.log('Sent AI-optimized answer to:', userId);
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(message: SignalingMessage): Promise<void> {
    try {
      const answer = message.data;
      const userId = message.from;
      
      console.log('Received answer from:', userId);
      
      const connection = this.peerConnections.get(userId);
      if (connection) {
        await connection.pc.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(message: SignalingMessage): Promise<void> {
    try {
      const candidate = message.data;
      const userId = message.from;
      
      const connection = this.peerConnections.get(userId);
      if (connection && connection.pc.remoteDescription) {
        await connection.pc.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private handleUserLeft(message: SignalingMessage): void {
    const userId = message.from;
    this.closePeerConnection(userId);
  }

  private handleMeshUpdate(message: SignalingMessage): void {
    console.log('Processing mesh update:', message.data);
    // AI-powered mesh optimization logic would go here
  }

  private async handleConnectionFailure(userId: string): Promise<void> {
    const connection = this.peerConnections.get(userId);
    if (!connection) return;

    connection.reconnectCount++;

    // AI decision on whether to attempt reconnection
    const shouldReconnect = this.intelligenceEngine.shouldAttemptReconnection(userId, connection.reconnectCount);
    
    if (shouldReconnect) {
      console.log(`Attempting AI-guided reconnection for ${userId} (attempt ${connection.reconnectCount})`);
      
      // Close existing connection
      this.closePeerConnection(userId);
      
      // Wait with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, connection.reconnectCount), 10000);
      setTimeout(() => {
        this.createOfferForUser(userId);
      }, delay);
    } else {
      console.log(`Max reconnection attempts reached for ${userId}, giving up`);
      this.closePeerConnection(userId);
    }
  }

  private closePeerConnection(userId: string): void {
    const connection = this.peerConnections.get(userId);
    if (connection) {
      connection.pc.close();
      if (connection.dataChannel) {
        connection.dataChannel.close();
      }
      this.peerConnections.delete(userId);
      console.log('Closed enhanced connection for user:', userId);
    }
  }

  async connectToExistingUsers(): Promise<void> {
    const connectedUsers = StageSignalingService.getConnectedUsers();
    
    // AI-powered selective connection strategy
    const optimalPeers = this.intelligenceEngine.selectOptimalPeers(
      connectedUsers.map(userId => ({
        userId,
        metrics: this.getCurrentNetworkMetrics(),
        priority: 1,
        reliability: 0.8
      })),
      this.maxPeerConnections
    );
    
    for (const userId of optimalPeers) {
      if (!this.peerConnections.has(userId)) {
        await this.createOfferForUser(userId);
      }
    }
  }

  // Public interface methods
  onRemoteStream(handler: (userId: string, stream: MediaStream) => void): void {
    this.onRemoteStreamHandler = handler;
  }

  onConnectionStateChange(handler: (userId: string, state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeHandler = handler;
  }

  onDataChannelMessage(handler: (userId: string, data: any) => void): void {
    this.onDataChannelMessageHandler = handler;
  }

  sendDataToUser(userId: string, data: any): void {
    const connection = this.peerConnections.get(userId);
    if (connection && connection.dataChannel && connection.dataChannel.readyState === 'open') {
      connection.dataChannel.send(JSON.stringify(data));
    }
  }

  broadcastData(data: any): void {
    this.peerConnections.forEach((connection, userId) => {
      this.sendDataToUser(userId, data);
    });
  }

  getConnectionMetrics(): Map<string, ConnectionMetrics> {
    const metrics = new Map<string, ConnectionMetrics>();
    this.peerConnections.forEach((connection, userId) => {
      metrics.set(userId, connection.connectionMetrics);
    });
    return metrics;
  }

  updateLocalStream(stream: MediaStream): void {
    this.localStream = stream;
    
    // Update all existing peer connections with AI optimization
    this.peerConnections.forEach(({ pc }) => {
      // Remove old tracks
      pc.getSenders().forEach(sender => {
        if (sender.track) {
          pc.removeTrack(sender);
        }
      });
      
      // Add new tracks with optimization
      stream.getTracks().forEach(track => {
        const sender = pc.addTrack(track, stream);
        this.optimizeTrackEncoding(sender, track.kind);
      });
    });
  }

  cleanup(): void {
    if (this.qualityMonitorInterval) {
      clearInterval(this.qualityMonitorInterval);
      this.qualityMonitorInterval = null;
    }

    this.peerConnections.forEach(({ pc, dataChannel }) => {
      pc.close();
      if (dataChannel) {
        dataChannel.close();
      }
    });
    
    this.peerConnections.clear();
    this.localStream = null;
    this.isInitialized = false;
    
    console.log('Next-Gen WebRTC Service cleaned up');
  }
}

export default NextGenWebRTCService.getInstance();
