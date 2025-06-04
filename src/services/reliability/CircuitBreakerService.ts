
export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls: number;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
  successCount: number;
}

export class CircuitBreakerService {
  private static instance: CircuitBreakerService;
  private circuits: Map<string, CircuitBreakerState> = new Map();
  private configs: Map<string, CircuitBreakerConfig> = new Map();

  static getInstance(): CircuitBreakerService {
    if (!CircuitBreakerService.instance) {
      CircuitBreakerService.instance = new CircuitBreakerService();
    }
    return CircuitBreakerService.instance;
  }

  createCircuit(
    name: string, 
    config: Partial<CircuitBreakerConfig> = {}
  ): void {
    const defaultConfig: CircuitBreakerConfig = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 seconds
      halfOpenMaxCalls: 3
    };

    this.configs.set(name, { ...defaultConfig, ...config });
    this.circuits.set(name, {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
      successCount: 0
    });

    console.log(`Circuit breaker created: ${name}`);
  }

  async execute<T>(
    circuitName: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const circuit = this.circuits.get(circuitName);
    const config = this.configs.get(circuitName);

    if (!circuit || !config) {
      throw new Error(`Circuit breaker ${circuitName} not found`);
    }

    // Check if circuit should transition to half-open
    this.checkStateTransition(circuitName);

    const currentState = circuit.state;

    if (currentState === 'OPEN') {
      console.log(`Circuit ${circuitName} is OPEN, using fallback`);
      if (fallback) {
        return await fallback();
      }
      throw new Error(`Circuit ${circuitName} is open`);
    }

    if (currentState === 'HALF_OPEN' && circuit.successCount >= config.halfOpenMaxCalls) {
      console.log(`Circuit ${circuitName} HALF_OPEN limit reached`);
      if (fallback) {
        return await fallback();
      }
      throw new Error(`Circuit ${circuitName} half-open limit reached`);
    }

    try {
      const result = await this.executeWithTimeout(operation, 10000); // 10s timeout
      this.onSuccess(circuitName);
      return result;
    } catch (error) {
      this.onFailure(circuitName);
      if (fallback) {
        return await fallback();
      }
      throw error;
    }
  }

  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Operation timeout'));
      }, timeoutMs);

      operation()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }

  private onSuccess(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (!circuit) return;

    if (circuit.state === 'HALF_OPEN') {
      circuit.successCount++;
      
      // Transition to CLOSED if enough successes
      if (circuit.successCount >= 3) {
        circuit.state = 'CLOSED';
        circuit.failureCount = 0;
        circuit.successCount = 0;
        console.log(`Circuit ${circuitName} transitioned to CLOSED`);
      }
    } else if (circuit.state === 'CLOSED') {
      circuit.failureCount = Math.max(0, circuit.failureCount - 1);
    }

    this.circuits.set(circuitName, circuit);
  }

  private onFailure(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    const config = this.configs.get(circuitName);
    if (!circuit || !config) return;

    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();

    // Transition to OPEN if threshold exceeded
    if (circuit.failureCount >= config.failureThreshold) {
      circuit.state = 'OPEN';
      circuit.nextAttemptTime = Date.now() + config.recoveryTimeout;
      console.log(`Circuit ${circuitName} transitioned to OPEN`);
    }

    this.circuits.set(circuitName, circuit);
  }

  private checkStateTransition(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (!circuit) return;

    if (circuit.state === 'OPEN' && Date.now() >= circuit.nextAttemptTime) {
      circuit.state = 'HALF_OPEN';
      circuit.successCount = 0;
      console.log(`Circuit ${circuitName} transitioned to HALF_OPEN`);
      this.circuits.set(circuitName, circuit);
    }
  }

  getCircuitState(circuitName: string): CircuitBreakerState | null {
    return this.circuits.get(circuitName) || null;
  }

  getAllCircuits(): Map<string, CircuitBreakerState> {
    return new Map(this.circuits);
  }

  resetCircuit(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (circuit) {
      circuit.state = 'CLOSED';
      circuit.failureCount = 0;
      circuit.successCount = 0;
      circuit.lastFailureTime = 0;
      circuit.nextAttemptTime = 0;
      this.circuits.set(circuitName, circuit);
      console.log(`Circuit ${circuitName} reset`);
    }
  }
}

export default CircuitBreakerService.getInstance();
