import { ApplicationConfig, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { HttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { AuthService } from './services/auth.service';
import { policyReducer } from './store/policy/policy.reducer';
import { PolicyEffects } from './store/policy/policy.effects';
import { PolicyService } from './services/policy.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideApollo(() => {
      const httpClient = inject(HttpClient);
      const httpLink = new HttpLink(httpClient);
      return {
        cache: new InMemoryCache(),
        link: httpLink.create({
          uri: 'http://localhost:4000/graphql',
        }),
      };
    }),
    provideStore({
      auth: authReducer,
      policy: policyReducer
    }),
    provideEffects([AuthEffects, PolicyEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
    }),
    AuthService,
    PolicyService
  ]
};