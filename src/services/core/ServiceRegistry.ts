
export interface ServiceDefinition {
  name: string;
  instance: any;
  dependencies: string[];
  isHealthy: boolean;
  lastHealthCheck: Date;
  healthCheckInterval?: number;
}

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, ServiceDefinition> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  registerService(definition: Omit<ServiceDefinition, 'isHealthy' | 'lastHealthCheck'>): void {
    const serviceDefinition: ServiceDefinition = {
      ...definition,
      isHealthy: true,
      lastHealthCheck: new Date()
    };

    this.services.set(definition.name, serviceDefinition);

    // Setup health checking if interval is specified
    if (definition.healthCheckInterval) {
      this.setupHealthCheck(definition.name, definition.healthCheckInterval);
    }

    console.log(`ServiceRegistry: Registered service ${definition.name}`);
  }

  getService<T>(name: string): T | null {
    const service = this.services.get(name);
    return service ? service.instance : null;
  }

  getServiceHealth(name: string): { isHealthy: boolean; lastCheck: Date } | null {
    const service = this.services.get(name);
    return service ? {
      isHealthy: service.isHealthy,
      lastCheck: service.lastHealthCheck
    } : null;
  }

  async checkServiceHealth(name: string): Promise<boolean> {
    const service = this.services.get(name);
    if (!service) return false;

    try {
      // Check if service has a health check method
      if (service.instance && typeof service.instance.healthCheck === 'function') {
        const isHealthy = await service.instance.healthCheck();
        service.isHealthy = isHealthy;
      } else {
        // Basic health check - verify service instance exists
        service.isHealthy = !!service.instance;
      }

      service.lastHealthCheck = new Date();
      return service.isHealthy;
    } catch (error) {
      console.error(`ServiceRegistry: Health check failed for ${name}:`, error);
      service.isHealthy = false;
      service.lastHealthCheck = new Date();
      return false;
    }
  }

  async checkAllServices(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [name] of this.services) {
      const isHealthy = await this.checkServiceHealth(name);
      results.set(name, isHealthy);
    }

    return results;
  }

  private setupHealthCheck(serviceName: string, interval: number): void {
    // Clear existing interval if any
    const existingInterval = this.healthCheckIntervals.get(serviceName);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Setup new health check interval
    const intervalId = setInterval(async () => {
      await this.checkServiceHealth(serviceName);
    }, interval);

    this.healthCheckIntervals.set(serviceName, intervalId);
  }

  unregisterService(name: string): void {
    // Clear health check interval
    const interval = this.healthCheckIntervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(name);
    }

    // Remove service
    this.services.delete(name);
    console.log(`ServiceRegistry: Unregistered service ${name}`);
  }

  listServices(): string[] {
    return Array.from(this.services.keys());
  }

  getUnhealthyServices(): string[] {
    return Array.from(this.services.entries())
      .filter(([_, service]) => !service.isHealthy)
      .map(([name]) => name);
  }

  shutdown(): void {
    // Clear all health check intervals
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();

    // Clear services
    this.services.clear();
    console.log('ServiceRegistry: Shutdown complete');
  }
}

export default ServiceRegistry.getInstance();
