import { ApplicationConfig, provideZoneChangeDetection, inject, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { AuthService } from './services/auth.service';
import { policyReducer } from './store/policy/policy.reducer';
import { PolicyEffects } from './store/policy/policy.effects';
import { PolicyService } from './services/policy.service';
import { userReducer } from './store/user/user.reducer';
import { UserEffects } from './store/user/user.effects';
import { CustomerPolicy } from './services/customer-policy';
import { CustomerEffects } from './store/customer/customer.effects';
import { customerReducer } from './store/customer/customer.reducer';
import { AgentEffects } from './store/agent/agent.effects';
import { agentReducer } from './store/agent/agent.reducer';
import { AgentService } from './services/agent';
import { authInterceptor } from './interceptors/auth.interceptor';
import { contentTypeInterceptor } from './interceptors/content-type.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, contentTypeInterceptor])),
    provideApollo(() => {
      const httpClient = inject(HttpClient);
      const httpLink = new HttpLink(httpClient);
      return {
        cache: new InMemoryCache(),
        link: httpLink.create({
          uri: `${environment.apiUrl}/graphql`,
        }),
      };
    }),
    provideStore({
      auth: authReducer,
      policy: policyReducer,
      users: userReducer,
      customer: customerReducer,
      agent: agentReducer
    }),
    provideEffects([AuthEffects, PolicyEffects, UserEffects, CustomerEffects, AgentEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
    }),
    AuthService,
    PolicyService,
    CustomerPolicy,
    AgentService
  ]
};