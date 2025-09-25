import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import * as PolicyActions from '../../../store/policy/policy.actions';
import { selectPolicyLoading, selectPolicyError, selectPolicies } from '../../../store/policy/policy.selectors';

@Component({
  selector: 'app-admin-policy-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-policy-list.html',
  styleUrl: './admin-policy-list.css'
})
export class AdminPolicyList implements OnInit{

  policies$: Observable<any[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private store: Store, private actions$: Actions) {
    this.policies$ = this.store.select(selectPolicies);
    this.loading$ = this.store.select(selectPolicyLoading);
    this.error$ = this.store.select(selectPolicyError);
  }
  editingPolicy:any|null=null;

  ngOnInit(): void {
    this.store.dispatch(PolicyActions.loadPolicies());
    
    // Listen for successful policy updates and deletes, then reload the list
    this.actions$.pipe(
      ofType(PolicyActions.updatePolicySuccess, PolicyActions.deletePolicySuccess)
    ).subscribe(() => {
      this.store.dispatch(PolicyActions.loadPolicies());
    });
  }

  deletePolicy(policyId:string){
    if(confirm('Are you sure you want to delete this policy?')){
      this.store.dispatch(PolicyActions.deletePolicy({policyId}));
    }

  }
  startEdit(policy: any){
    this.editingPolicy={...policy};
  }

  saveEdit(){
    if(this.editingPolicy){
      this.store.dispatch(PolicyActions.updatePolicy({policyId:this.editingPolicy._id,policyData:this.editingPolicy}));
      this.editingPolicy=null;
    }
  }
  cancelEdit(){
    this.editingPolicy=null;
  }
}
