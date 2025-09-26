import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

// Declare jasmine global for TypeScript
declare const jasmine: any;

export interface TestConfig {
  imports?: any[];
  providers?: any[];
  declarations?: any[];
}

export function createMockStore() {
  return jasmine.createSpyObj('Store', ['select', 'dispatch'], {
    select: jasmine.createSpy('select').and.returnValue(of(null)),
    dispatch: jasmine.createSpy('dispatch')
  });
}

export function createMockRouter() {
  return jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'], {
    navigate: jasmine.createSpy('navigate'),
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  });
}

export function createMockActivatedRoute() {
  return {
    snapshot: {
      params: {},
      queryParams: {},
      data: {}
    },
    params: of({}),
    queryParams: of({}),
    data: of({})
  };
}

export function setupTestBed(config: TestConfig) {
  const defaultImports = [
    RouterTestingModule.withRoutes([]),
    HttpClientTestingModule,
    ...(config.imports || [])
  ];

  const defaultProviders = [
    { provide: Store, useValue: createMockStore() },
    { provide: Router, useValue: createMockRouter() },
    { provide: ActivatedRoute, useValue: createMockActivatedRoute() },
    ...(config.providers || [])
  ];

  return TestBed.configureTestingModule({
    imports: defaultImports,
    declarations: config.declarations || [],
    providers: defaultProviders
  });
}

export function getMockStore(): any {
  return TestBed.inject(Store) as any;
}

export function getMockRouter(): any {
  return TestBed.inject(Router) as any;
}

export function getMockActivatedRoute() {
  return TestBed.inject(ActivatedRoute);
}
