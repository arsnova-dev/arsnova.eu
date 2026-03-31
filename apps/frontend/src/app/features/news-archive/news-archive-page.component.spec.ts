import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsArchivePageComponent } from './news-archive-page.component';
import { MotdHeaderRefreshService } from '../../core/motd-header-refresh.service';
import type { NewsArchiveInitialModel } from './news-archive-initial';

const listArchiveQuery = vi.fn();

vi.mock('../../core/trpc.client', () => ({
  trpc: {
    motd: {
      listArchive: { query: (...args: unknown[]) => listArchiveQuery(...args) },
    },
  },
}));

const emptyResolved: NewsArchiveInitialModel = {
  items: [],
  nextCursor: null,
  archiveMaxEndsAtIso: null,
  archiveUnreadCount: 0,
  errorMessage: null,
  titleById: {},
  htmlById: {},
};

describe('NewsArchivePageComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    listArchiveQuery.mockReset();
    listArchiveQuery.mockResolvedValue({ items: [], nextCursor: null });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('nutzt Resolver-Daten ohne weiteres listArchive', () => {
    TestBed.configureTestingModule({
      imports: [NewsArchivePageComponent],
      providers: [
        { provide: LOCALE_ID, useValue: 'de' },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { newsArchive: emptyResolved } } },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MotdHeaderRefreshService, useValue: { notifyMotdHeaderRefresh: vi.fn() } },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<NewsArchivePageComponent> =
      TestBed.createComponent(NewsArchivePageComponent);
    fixture.detectChanges();

    expect(listArchiveQuery).not.toHaveBeenCalled();
    expect(fixture.componentInstance.items().length).toBe(0);
  });
});
