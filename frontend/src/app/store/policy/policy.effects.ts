import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PolicyService } from '../../services/policy.service';
import * as PolicyActions from './policy.actions';

@Injectable()
export class PolicyEffects {
  private actions$ = inject(Actions);
  private policyService = inject(PolicyService);
  
  createPolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PolicyActions.createPolicy),
      switchMap(({ code, title, description, premium, termMonths, minSumInsured, image }) =>
        this.policyService.createPolicy({
          code,
          title,
          description,
          premium,
          termMonths,
          minSumInsured,
          image
        }).pipe(
          map((policy) => PolicyActions.createPolicySuccess({ policy })),
          catchError((error) => of(PolicyActions.createPolicyFailure({ 
            error: error.error?.message || 'Failed to create policy' 
          })))
        )
      )
    )
  );

  loadPolicies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PolicyActions.loadPolicies),
      switchMap(() =>
        this.policyService.getPolicies().pipe(
          map((policies) => PolicyActions.loadPoliciesSuccess({ policies })),
          catchError((error) => of(PolicyActions.loadPoliciesFailure({ 
            error: error.error?.message || 'Failed to load policies' 
          })))
        )
      )
    )
  );

  deletePolicy$ = createEffect(() =>
    this.actions$.pipe(
        ofType(PolicyActions.deletePolicy),
        switchMap(({ policyId }) =>
            this.policyService.deletePolicy(policyId).pipe(
                map(() => PolicyActions.deletePolicySuccess({ policyId })),
                catchError((error) => of(PolicyActions.deletePolicyFailure({ error: error.error?.message || 'Failed to delete policy' })))
            )
        )
    )
  );

updatePolicy$ = createEffect(() =>
    this.actions$.pipe(
        ofType(PolicyActions.updatePolicy),
        switchMap(({ policyId, policyData }) =>
            this.policyService.updatePolicy(policyId, policyData).pipe(
                map((policy) => PolicyActions.updatePolicySuccess({ policy })),
                catchError((error) => of(PolicyActions.updatePolicyFailure({ error: error.error?.message || 'Failed to update policy' })))
            )
        )
    )
  );
}
