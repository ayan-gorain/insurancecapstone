import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CustomerPolicy } from '../../services/customer-policy';
import * as CustomerActions from './customer.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class CustomerEffects {
  private actions$ = inject(Actions);
  private customerPolicy = inject(CustomerPolicy);

  loadAvailablePolicies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.loadAvailablePolicies),
      mergeMap(() => {
        console.log('Customer Effects - Loading available policies...');
        return this.customerPolicy.getAvailablePolicies().pipe(
          map((policies) => {
            console.log('Customer Effects - Policies received:', policies);
            console.log('Customer Effects - Policies count:', policies?.length || 0);
            return CustomerActions.loadAvailablePoliciesSuccess({ policies });
          }),
          catchError((error) => {
            console.error('Customer Effects - Error loading policies:', error);
            return of(CustomerActions.loadAvailablePoliciesFailure({ error }));
          })
        );
      })
    )
  );

  loadMyPolicies$ = createEffect(()=>
    this.actions$.pipe(
      ofType(CustomerActions.loadMyPolicies),
      mergeMap(()=>
        this.customerPolicy.getMyPolicies().pipe(
          map((policies)=>CustomerActions.loadMyPoliciesSuccess({policies})),
          catchError((error)=>of(CustomerActions.loadMyPoliciesFailure({error})))
        )
      )
    )
  );

  buyPolicy$ = createEffect(()=>
    this.actions$.pipe(
      ofType(CustomerActions.buyPolicy),
      mergeMap(({policyId, body})=>
        this.customerPolicy.buyPolicy(policyId, body).pipe(
          map((response)=>{
            return CustomerActions.buyPolicySuccess({userPolicy: response.userPolicy});
          }),
          catchError((error)=>{
            console.error('Buy policy error:', error);
            const errorMessage = error.error?.message || error.message || 'Unknown error occurred';
            alert(`Purchase failed: ${errorMessage}\nPlease check your details and try again.`);
            return of(CustomerActions.buyPolicyFailure({error}));
          })
        )
      )
    )
  );

  // Reload policies after successful purchase
  buyPolicySuccess$ = createEffect(()=>
    this.actions$.pipe(
      ofType(CustomerActions.buyPolicySuccess),
      mergeMap(()=>[
        CustomerActions.loadMyPolicies(),
        CustomerActions.loadAvailablePolicies()
      ])
    )
  );

  cancelPolicy$ = createEffect(()=>
    this.actions$.pipe(
      ofType(CustomerActions.cancelPolicy),
      mergeMap(({policyId})=>
        this.customerPolicy.cancelPolicy(policyId).pipe(
          map(()=>CustomerActions.cancelPolicySuccess({policyId})),
          catchError((error)=>of(CustomerActions.cancelPolicyFailure({error})))
        )
      )
    )
  );

  // Claims effects
  submitClaim$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.submitClaim),
      mergeMap(({ claimData }) =>
        this.customerPolicy.submitClaim(claimData).pipe(
          map((response) => CustomerActions.submitClaimSuccess({ claim: response.claim })),
          catchError((error) => of(CustomerActions.submitClaimFailure({ error })))
        )
      )
    )
  );

  loadMyClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.loadMyClaims),
      mergeMap(() =>
        this.customerPolicy.getMyClaims().pipe(
          map((claims) => CustomerActions.loadMyClaimsSuccess({ claims })),
          catchError((error) => of(CustomerActions.loadMyClaimsFailure({ error })))
        )
      )
    )
  );

  loadClaimDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.loadClaimDetails),
      mergeMap(({ claimId }) =>
        this.customerPolicy.getClaimDetails(claimId).pipe(
          map((claimDetails) => CustomerActions.loadClaimDetailsSuccess({ claimDetails })),
          catchError((error) => of(CustomerActions.loadClaimDetailsFailure({ error })))
        )
      )
    )
  );

  loadClaimStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.loadClaimStats),
      mergeMap(() =>
        this.customerPolicy.getClaimStats().pipe(
          map((stats) => CustomerActions.loadClaimStatsSuccess({ stats })),
          catchError((error) => of(CustomerActions.loadClaimStatsFailure({ error })))
        )
      )
    )
  );

}
