import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // Improves perf by coalescing change detection; optional
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      // you can add interceptors here if needed
      withInterceptors([])
    ),
  ],
};
