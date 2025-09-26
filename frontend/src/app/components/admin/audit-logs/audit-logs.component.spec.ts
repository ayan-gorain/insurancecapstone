import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { AuditLogsComponent } from './audit-logs.component';

describe('AuditLogsComponent', () => {
  let component: AuditLogsComponent;
  let fixture: ComponentFixture<AuditLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLogsComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty audit logs', () => {
    expect(component.auditLogs).toEqual([]);
    expect(component.loading).toBeTrue();
    expect(component.error).toBeNull();
  });

  it('should load audit logs on init', () => {
    spyOn(component, 'loadAuditLogs');
    component.ngOnInit();
    expect(component.loadAuditLogs).toHaveBeenCalled();
  });

  it('should get correct badge class for CREATE_AGENT action', () => {
    const badgeClass = component.getActionBadgeClass('CREATE_AGENT');
    expect(badgeClass).toBe('bg-blue-500/20 text-blue-400 border border-blue-500/30');
  });

  it('should get correct badge class for ASSIGN_AGENT action', () => {
    const badgeClass = component.getActionBadgeClass('ASSIGN_AGENT');
    expect(badgeClass).toBe('bg-purple-500/20 text-purple-400 border border-purple-500/30');
  });

  it('should get correct badge class for CREATE_POLICY action', () => {
    const badgeClass = component.getActionBadgeClass('CREATE_POLICY');
    expect(badgeClass).toBe('bg-green-500/20 text-green-400 border border-green-500/30');
  });

  it('should get correct badge class for UPDATE_POLICY action', () => {
    const badgeClass = component.getActionBadgeClass('UPDATE_POLICY');
    expect(badgeClass).toBe('bg-yellow-500/20 text-yellow-400 border border-yellow-500/30');
  });

  it('should get correct badge class for DELETE_POLICY action', () => {
    const badgeClass = component.getActionBadgeClass('DELETE_POLICY');
    expect(badgeClass).toBe('bg-red-500/20 text-red-400 border border-red-500/30');
  });

  it('should get correct badge class for UPDATE_CLAIM action', () => {
    const badgeClass = component.getActionBadgeClass('UPDATE_CLAIM');
    expect(badgeClass).toBe('bg-orange-500/20 text-orange-400 border border-orange-500/30');
  });

  it('should get default badge class for unknown action', () => {
    const badgeClass = component.getActionBadgeClass('UNKNOWN_ACTION');
    expect(badgeClass).toBe('bg-gray-500/20 text-gray-400 border border-gray-500/30');
  });

  it('should format timestamp correctly', () => {
    const timestamp = '2023-12-01T10:30:00Z';
    const formatted = component.formatTimestamp(timestamp);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should get correct action description for CREATE_AGENT', () => {
    const description = component.getActionDescription('CREATE_AGENT', {});
    expect(description).toBe('Created a new agent');
  });

  it('should get correct action description for ASSIGN_AGENT', () => {
    const description = component.getActionDescription('ASSIGN_AGENT', {});
    expect(description).toBe('Assigned agent to customer');
  });

  it('should get correct action description for CREATE_POLICY', () => {
    const description = component.getActionDescription('CREATE_POLICY', {});
    expect(description).toBe('Created a new policy');
  });

  it('should get correct action description for UPDATE_POLICY', () => {
    const description = component.getActionDescription('UPDATE_POLICY', {});
    expect(description).toBe('Updated policy details');
  });

  it('should get correct action description for DELETE_POLICY', () => {
    const description = component.getActionDescription('DELETE_POLICY', {});
    expect(description).toBe('Deleted a policy');
  });

  it('should get correct action description for UPDATE_CLAIM with status', () => {
    const details = { status: 'approved' };
    const description = component.getActionDescription('UPDATE_CLAIM', details);
    expect(description).toBe('Updated claim status to approved');
  });

  it('should get correct action description for UPDATE_CLAIM without status', () => {
    const description = component.getActionDescription('UPDATE_CLAIM', {});
    expect(description).toBe('Updated claim status to unknown');
  });

  it('should get default action description for unknown action', () => {
    const description = component.getActionDescription('UNKNOWN_ACTION', {});
    expect(description).toBe('unknown action');
  });

  it('should get object keys', () => {
    const obj = { key1: 'value1', key2: 'value2' };
    const keys = component.getObjectKeys(obj);
    expect(keys).toEqual(['key1', 'key2']);
  });

  it('should format action name correctly', () => {
    const formatted = component.formatActionName('CREATE_AGENT');
    expect(formatted).toBe('CREATE AGENT');
  });
});
