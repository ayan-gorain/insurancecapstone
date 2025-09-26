import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AgentService } from '../../services/agent';
import * as AgentActions from './agent.actions';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';

@Injectable()
export class AgentEffects {
  private actions$ = inject(Actions);
  private agentService = inject(AgentService);


  // Customer Effects
  loadCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.loadCustomers),
      mergeMap(() =>
        this.agentService.getMyCustomers().pipe(
          map((customers) => AgentActions.loadCustomersSuccess({ customers })),
          catchError((error) => of(AgentActions.loadCustomersFailure({ error: error.message || 'Failed to load customers' })))
        )
      )
    )
  );

  loadCustomerPolicies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.loadCustomerPolicies),
      mergeMap(({ customerId }) =>
        this.agentService.getCustomerPolicies(customerId).pipe(
          map((policies) => AgentActions.loadCustomerPoliciesSuccess({ policies })),
          catchError((error) => of(AgentActions.loadCustomerPoliciesFailure({ error: error.message || 'Failed to load customer policies' })))
        )
      )
    )
  );

  loadCustomerClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.loadCustomerClaims),
      mergeMap(({ customerId }) =>
        this.agentService.getCustomerClaims(customerId).pipe(
          map((claims) => AgentActions.loadCustomerClaimsSuccess({ claims })),
          catchError((error) => of(AgentActions.loadCustomerClaimsFailure({ error: error.message || 'Failed to load customer claims' })))
        )
      )
    )
  );

  // Claims Effects
  loadClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.loadClaims),
      mergeMap(() =>
        this.agentService.getMyCustomersClaims().pipe(
          map((claims) => AgentActions.loadClaimsSuccess({ claims })),
          catchError((error) => of(AgentActions.loadClaimsFailure({ error: error.message || 'Failed to load claims' })))
        )
      )
    )
  );

  loadPendingClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.loadPendingClaims),
      mergeMap(() =>
        this.agentService.getPendingClaims().pipe(
          map((pendingClaims) => AgentActions.loadPendingClaimsSuccess({ pendingClaims })),
          catchError((error) => of(AgentActions.loadPendingClaimsFailure({ error: error.message || 'Failed to load pending claims' })))
        )
      )
    )
  );


  reviewClaim$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.reviewClaim),
      mergeMap(({ claimId, reviewData }) =>
        this.agentService.reviewClaim(claimId, reviewData).pipe(
          map((claim) => AgentActions.reviewClaimSuccess({ claim })),
          catchError((error) => of(AgentActions.reviewClaimFailure({ error: error.message || 'Failed to review claim' })))
        )
      )
    )
  );

  // Statistics Effects
  loadClaimStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.loadClaimStats),
      mergeMap(() =>
        this.agentService.getMyClaimStats().pipe(
          map((stats) => AgentActions.loadClaimStatsSuccess({ stats })),
          catchError((error) => of(AgentActions.loadClaimStatsFailure({ error: error.message || 'Failed to load claim stats' })))
        )
      )
    )
  );


  // Success Effects - Auto refresh after successful operations
  reviewClaimSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.reviewClaimSuccess),
      mergeMap(() => [
        AgentActions.loadPendingClaims(),
        AgentActions.loadClaimStats()
      ])
    )
  );


  // Error Effects
  handleError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AgentActions.loadCustomersFailure,
        AgentActions.loadClaimsFailure,
        AgentActions.loadPendingClaimsFailure,
        AgentActions.reviewClaimFailure,
        AgentActions.loadClaimStatsFailure,
        AgentActions.loadCustomerPoliciesFailure,
        AgentActions.loadCustomerClaimsFailure
      ),
      tap(({ error }) => {
        console.error('Agent Error:', error);
        // You can add toast notifications or other error handling here
      })
    ),
    { dispatch: false }
  );
}
