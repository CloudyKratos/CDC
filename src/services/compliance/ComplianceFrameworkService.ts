
export interface DataProcessingRecord {
  id: string;
  userId: string;
  dataType: 'personal' | 'medical' | 'financial' | 'biometric' | 'communications';
  action: 'collect' | 'process' | 'store' | 'transfer' | 'delete';
  purpose: string;
  legalBasis: string;
  timestamp: number;
  location: string;
  retention: number; // Days
  encrypted: boolean;
}

export interface ConsentRecord {
  userId: string;
  consentType: 'data_processing' | 'marketing' | 'analytics' | 'cookies';
  granted: boolean;
  timestamp: number;
  version: string;
  ipAddress: string;
  userAgent: string;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restrict';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  submittedAt: number;
  completedAt?: number;
  details: string;
}

export class ComplianceFrameworkService {
  private static instance: ComplianceFrameworkService;
  private dataProcessingRecords: DataProcessingRecord[] = [];
  private consentRecords: ConsentRecord[] = [];
  private dataSubjectRequests: DataSubjectRequest[] = [];
  private dataRetentionPolicies: Map<string, number> = new Map();
  private auditTrail: any[] = [];

  static getInstance(): ComplianceFrameworkService {
    if (!ComplianceFrameworkService.instance) {
      ComplianceFrameworkService.instance = new ComplianceFrameworkService();
    }
    return ComplianceFrameworkService.instance;
  }

  async initialize(): Promise<void> {
    // Initialize data retention policies
    this.initializeRetentionPolicies();
    
    // Start automated compliance checks
    this.startComplianceMonitoring();
    
    console.log('Compliance Framework Service initialized');
  }

  private initializeRetentionPolicies(): void {
    // GDPR default retention periods
    this.dataRetentionPolicies.set('personal', 365); // 1 year
    this.dataRetentionPolicies.set('medical', 2555); // 7 years (HIPAA)
    this.dataRetentionPolicies.set('financial', 2555); // 7 years (SOX)
    this.dataRetentionPolicies.set('biometric', 180); // 6 months
    this.dataRetentionPolicies.set('communications', 90); // 3 months
  }

  async recordDataProcessing(record: Omit<DataProcessingRecord, 'id' | 'timestamp'>): Promise<string> {
    const processingRecord: DataProcessingRecord = {
      ...record,
      id: `dp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.dataProcessingRecords.push(processingRecord);
    
    // Auto-set retention period if not specified
    if (!processingRecord.retention) {
      processingRecord.retention = this.dataRetentionPolicies.get(processingRecord.dataType) || 365;
    }

    this.auditTrail.push({
      action: 'data_processing_recorded',
      recordId: processingRecord.id,
      userId: processingRecord.userId,
      dataType: processingRecord.dataType,
      timestamp: Date.now()
    });

    console.log(`Data processing recorded: ${processingRecord.id}`);
    return processingRecord.id;
  }

  async recordConsent(consent: Omit<ConsentRecord, 'timestamp'>): Promise<void> {
    const consentRecord: ConsentRecord = {
      ...consent,
      timestamp: Date.now()
    };

    // Revoke previous consent of same type
    this.consentRecords = this.consentRecords.filter(
      c => !(c.userId === consent.userId && c.consentType === consent.consentType)
    );

    this.consentRecords.push(consentRecord);

    this.auditTrail.push({
      action: 'consent_recorded',
      userId: consent.userId,
      consentType: consent.consentType,
      granted: consent.granted,
      timestamp: Date.now()
    });

    console.log(`Consent recorded: ${consent.userId} - ${consent.consentType}: ${consent.granted}`);
  }

  async submitDataSubjectRequest(request: Omit<DataSubjectRequest, 'id' | 'submittedAt' | 'status'>): Promise<string> {
    const dataRequest: DataSubjectRequest = {
      ...request,
      id: `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submittedAt: Date.now(),
      status: 'pending'
    };

    this.dataSubjectRequests.push(dataRequest);

    this.auditTrail.push({
      action: 'data_subject_request_submitted',
      requestId: dataRequest.id,
      userId: dataRequest.userId,
      requestType: dataRequest.requestType,
      timestamp: Date.now()
    });

    // Auto-process simple requests
    if (dataRequest.requestType === 'access') {
      setTimeout(() => this.processAccessRequest(dataRequest.id), 1000);
    }

    console.log(`Data subject request submitted: ${dataRequest.id}`);
    return dataRequest.id;
  }

  private async processAccessRequest(requestId: string): Promise<void> {
    const request = this.dataSubjectRequests.find(r => r.id === requestId);
    if (!request) return;

    request.status = 'in_progress';

    // Compile user data
    const userData = {
      processingRecords: this.dataProcessingRecords.filter(r => r.userId === request.userId),
      consentRecords: this.consentRecords.filter(c => c.userId === request.userId),
      requests: this.dataSubjectRequests.filter(r => r.userId === request.userId)
    };

    // In a real implementation, this would generate a downloadable report
    console.log(`Access request processed for user: ${request.userId}`, userData);

    request.status = 'completed';
    request.completedAt = Date.now();

    this.auditTrail.push({
      action: 'data_subject_request_completed',
      requestId,
      userId: request.userId,
      timestamp: Date.now()
    });
  }

  async processErasureRequest(requestId: string): Promise<void> {
    const request = this.dataSubjectRequests.find(r => r.id === requestId);
    if (!request || request.requestType !== 'erasure') return;

    request.status = 'in_progress';

    // Remove user data (respecting legal obligations)
    this.dataProcessingRecords = this.dataProcessingRecords.filter(
      r => r.userId !== request.userId || this.mustRetainData(r)
    );

    this.consentRecords = this.consentRecords.filter(
      c => c.userId !== request.userId
    );

    request.status = 'completed';
    request.completedAt = Date.now();

    this.auditTrail.push({
      action: 'data_erasure_completed',
      requestId,
      userId: request.userId,
      timestamp: Date.now()
    });

    console.log(`Data erasure completed for user: ${request.userId}`);
  }

  private mustRetainData(record: DataProcessingRecord): boolean {
    // Check if data must be retained for legal reasons
    if (record.dataType === 'financial' || record.dataType === 'medical') {
      const retentionPeriod = this.dataRetentionPolicies.get(record.dataType) || 0;
      const retentionEnd = record.timestamp + (retentionPeriod * 24 * 60 * 60 * 1000);
      return Date.now() < retentionEnd;
    }
    return false;
  }

  getConsent(userId: string, consentType: string): ConsentRecord | null {
    return this.consentRecords.find(
      c => c.userId === userId && c.consentType === consentType && c.granted
    ) || null;
  }

  hasValidConsent(userId: string, consentType: string): boolean {
    const consent = this.getConsent(userId, consentType);
    return consent !== null;
  }

  private startComplianceMonitoring(): void {
    // Run compliance checks every hour
    setInterval(() => {
      this.performComplianceChecks();
    }, 60 * 60 * 1000);

    // Daily data retention cleanup
    setInterval(() => {
      this.enforceDataRetention();
    }, 24 * 60 * 60 * 1000);
  }

  private performComplianceChecks(): void {
    console.log('Performing automated compliance checks...');

    // Check for expired data
    this.checkExpiredData();
    
    // Check for missing consent
    this.checkMissingConsent();
    
    // Check pending data subject requests
    this.checkPendingRequests();
  }

  private checkExpiredData(): void {
    const now = Date.now();
    let expiredCount = 0;

    this.dataProcessingRecords.forEach(record => {
      const retentionEnd = record.timestamp + (record.retention * 24 * 60 * 60 * 1000);
      if (now > retentionEnd && !this.mustRetainData(record)) {
        expiredCount++;
      }
    });

    if (expiredCount > 0) {
      console.warn(`${expiredCount} data records have exceeded retention period`);
    }
  }

  private checkMissingConsent(): void {
    const processedUsers = new Set(this.dataProcessingRecords.map(r => r.userId));
    let missingConsentCount = 0;

    processedUsers.forEach(userId => {
      if (!this.hasValidConsent(userId, 'data_processing')) {
        missingConsentCount++;
      }
    });

    if (missingConsentCount > 0) {
      console.warn(`${missingConsentCount} users missing data processing consent`);
    }
  }

  private checkPendingRequests(): void {
    const pendingRequests = this.dataSubjectRequests.filter(r => r.status === 'pending');
    const overdueRequests = pendingRequests.filter(r => 
      Date.now() - r.submittedAt > 30 * 24 * 60 * 60 * 1000 // 30 days
    );

    if (overdueRequests.length > 0) {
      console.warn(`${overdueRequests.length} data subject requests are overdue`);
    }
  }

  private enforceDataRetention(): void {
    const now = Date.now();
    let deletedCount = 0;

    this.dataProcessingRecords = this.dataProcessingRecords.filter(record => {
      const retentionEnd = record.timestamp + (record.retention * 24 * 60 * 60 * 1000);
      const shouldDelete = now > retentionEnd && !this.mustRetainData(record);
      
      if (shouldDelete) {
        deletedCount++;
        this.auditTrail.push({
          action: 'data_auto_deleted',
          recordId: record.id,
          userId: record.userId,
          reason: 'retention_period_expired',
          timestamp: now
        });
      }
      
      return !shouldDelete;
    });

    if (deletedCount > 0) {
      console.log(`Auto-deleted ${deletedCount} expired data records`);
    }
  }

  // Compliance reporting methods
  generateGDPRReport(startDate: number, endDate: number): any {
    const report = {
      period: { start: startDate, end: endDate },
      dataProcessing: this.dataProcessingRecords.filter(
        r => r.timestamp >= startDate && r.timestamp <= endDate
      ),
      consentRecords: this.consentRecords.filter(
        c => c.timestamp >= startDate && c.timestamp <= endDate
      ),
      dataSubjectRequests: this.dataSubjectRequests.filter(
        r => r.submittedAt >= startDate && r.submittedAt <= endDate
      ),
      compliance: {
        consentRate: this.calculateConsentRate(),
        averageResponseTime: this.calculateAverageResponseTime(),
        dataRetentionCompliance: this.calculateRetentionCompliance()
      }
    };

    return report;
  }

  private calculateConsentRate(): number {
    const totalUsers = new Set(this.dataProcessingRecords.map(r => r.userId)).size;
    const usersWithConsent = new Set(
      this.consentRecords.filter(c => c.granted).map(c => c.userId)
    ).size;
    
    return totalUsers > 0 ? (usersWithConsent / totalUsers) * 100 : 0;
  }

  private calculateAverageResponseTime(): number {
    const completedRequests = this.dataSubjectRequests.filter(
      r => r.status === 'completed' && r.completedAt
    );
    
    if (completedRequests.length === 0) return 0;
    
    const totalTime = completedRequests.reduce((sum, r) => 
      sum + (r.completedAt! - r.submittedAt), 0
    );
    
    return totalTime / completedRequests.length / (24 * 60 * 60 * 1000); // Days
  }

  private calculateRetentionCompliance(): number {
    const totalRecords = this.dataProcessingRecords.length;
    const compliantRecords = this.dataProcessingRecords.filter(r => {
      const retentionEnd = r.timestamp + (r.retention * 24 * 60 * 60 * 1000);
      return Date.now() <= retentionEnd || this.mustRetainData(r);
    }).length;
    
    return totalRecords > 0 ? (compliantRecords / totalRecords) * 100 : 100;
  }

  getDataProcessingRecords(userId?: string): DataProcessingRecord[] {
    if (userId) {
      return this.dataProcessingRecords.filter(r => r.userId === userId);
    }
    return [...this.dataProcessingRecords];
  }

  getConsentRecords(userId?: string): ConsentRecord[] {
    if (userId) {
      return this.consentRecords.filter(c => c.userId === userId);
    }
    return [...this.consentRecords];
  }

  getDataSubjectRequests(userId?: string): DataSubjectRequest[] {
    if (userId) {
      return this.dataSubjectRequests.filter(r => r.userId === userId);
    }
    return [...this.dataSubjectRequests];
  }

  getAuditTrail(): any[] {
    return [...this.auditTrail];
  }

  cleanup(): void {
    this.dataProcessingRecords = [];
    this.consentRecords = [];
    this.dataSubjectRequests = [];
    this.auditTrail = [];
    
    console.log('Compliance Framework Service cleaned up');
  }
}

export default ComplianceFrameworkService.getInstance();
