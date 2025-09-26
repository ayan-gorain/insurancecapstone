import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-agent-profile',
  templateUrl: './agent-profile.html',
  standalone: true,
  imports: [CommonModule]
})
export class AgentProfile implements OnInit {
  user$: Observable<any | null>;

  constructor(private store: Store) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    // Component initialization
  }

  onImageError(event: any): void {
    // Hide the image and show the fallback initial
    event.target.style.display = 'none';
    const fallback = event.target.nextElementSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  }
}
