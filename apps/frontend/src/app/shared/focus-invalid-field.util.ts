import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';

function isVisible(element: HTMLElement): boolean {
  const view = element.ownerDocument.defaultView;
  if (!view) return true;

  const style = view.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  return element.offsetParent !== null || style.position === 'fixed';
}

export function focusAndScrollElement(element: HTMLElement | null | undefined): boolean {
  if (!element) return false;

  if (typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }

  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }

  return true;
}

function findFirstInvalidPath(
  control: AbstractControl | null | undefined,
  path: string[] = [],
): string[] | null {
  if (!control || control.disabled) return null;

  if (control instanceof FormControl) {
    return control.invalid ? path : null;
  }

  if (control instanceof FormGroup) {
    const entries = Object.entries(control.controls);
    for (const [name, childControl] of entries) {
      const childPath = findFirstInvalidPath(childControl, [...path, name]);
      if (childPath) return childPath;
    }
    return null;
  }

  if (control instanceof FormArray) {
    for (let i = 0; i < control.length; i += 1) {
      const childPath = findFirstInvalidPath(control.at(i), [...path, `${i}`]);
      if (childPath) return childPath;
    }
    return null;
  }

  return control.invalid ? path : null;
}

function isIndexSegment(segment: string): boolean {
  return /^\d+$/.test(segment);
}

function buildSelectorForPath(path: string[]): string {
  const parts: string[] = [];

  for (let i = 0; i < path.length; i += 1) {
    const segment = path[i]!;
    const next = path[i + 1];
    const isLast = i === path.length - 1;

    if (isLast) {
      parts.push(`[formcontrolname="${segment}"]`);
      continue;
    }

    if (isIndexSegment(segment)) {
      parts.push(`[formgroupname="${segment}"]`);
      continue;
    }

    if (next && isIndexSegment(next)) {
      parts.push(`[formarrayname="${segment}"]`);
    } else {
      parts.push(`[formgroupname="${segment}"]`);
    }
  }

  return parts.join(' ');
}

export function focusFirstInvalidField(
  container: ParentNode | null | undefined,
  form?: AbstractControl | null,
): boolean {
  if (!container) return false;

  if (form) {
    const path = findFirstInvalidPath(form);
    if (path && path.length > 0) {
      const selector = buildSelectorForPath(path);
      const targetByPath = container.querySelector<HTMLElement>(selector);
      if (focusAndScrollElement(targetByPath)) {
        return true;
      }

      const lastSegment = path[path.length - 1];
      if (lastSegment) {
        const fallback = container.querySelector<HTMLElement>(
          `[formcontrolname="${lastSegment}"]`,
        );
        if (focusAndScrollElement(fallback)) {
          return true;
        }
      }
    }
  }

  const selector = [
    'input.ng-invalid:not([type="hidden"]):not([disabled])',
    'textarea.ng-invalid:not([disabled])',
    'select.ng-invalid:not([disabled])',
    'mat-select.ng-invalid',
    'mat-checkbox.ng-invalid',
  ].join(', ');

  const candidates = Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (field) => isVisible(field),
  );
  const first = candidates[0];
  if (!first) return false;

  return focusAndScrollElement(first);
}
