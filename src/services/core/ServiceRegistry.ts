
export interface ServiceInstance {
  initialize?: () => Promise<void>;
  cleanup?: () => void;
  isHealthy?: () => boolean;
}

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, any> = new Map();
  private healthChecks: Map<string, () => boolean> = new Map();

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  registerService(name: string, service: any): void {
    this.services.set(name, service);
    
    // Register health check if service has isHealthy method
    if (service.isHealthy && typeof service.isHealthy === 'function') {
      this.healthChecks.set(name, () => service.isHealthy());
    } else {
      // Default health check
      this.healthChecks.set(name, () => true);
    }
    
    console.log(`Service registered: ${name}`);
  }

  getService<T>(name: string): T | null {
    return this.services.get(name) || null;
  }

  getHealthStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    
    this.healthChecks.forEach((healthCheck, serviceName) => {
      try {
        status[serviceName] = healthCheck();
      } catch (error) {
        console.error(`Health check failed for ${serviceName}:`, error);
        status[serviceName] = false;
      }
    });
    
    return status;
  }

  async initializeAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    
    this.services.forEach((service, name) => {
      if (service.initialize && typeof service.initialize === 'function') {
        promises.push(
          service.initialize().catch((error: Error) => {
            console.error(`Failed to initialize service ${name}:`, error);
          })
        );
      }
    });
    
    await Promise.all(promises);
  }

  cleanup(): void {
    this.services.forEach((service, name) => {
      try {
        if (service.cleanup && typeof service.cleanup === 'function') {
          service.cleanup();
        }
      } catch (error) {
        console.error(`Error cleaning up service ${name}:`, error);
      }
    });
    
    this.services.clear();
    this.healthChecks.clear();
    console.log('Service registry cleaned up');
  }

  listServices(): string[] {
    return Array.from(this.services.keys());
  }

  isServiceRegistered(name: string): boolean {
    return this.services.has(name);
  }
}

export default ServiceRegistry.getInstance();
