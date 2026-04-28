'use client';

import { usePostHog } from 'posthog-js/react';

export function useAnalytics() {
  const posthog = usePostHog();

  const track = (event: string, properties?: Record<string, unknown>) => {
    posthog?.capture(event, properties);
  };

  return {
    // Unit browsing
    trackUnitViewed: (unitName: string, unitNumber: number, type: 'bedrijfsunit' | 'opslagbox', price: number) =>
      track('unit_viewed', { unit_name: unitName, unit_number: unitNumber, unit_type: type, price }),

    trackUnitModalOpened: (unitName: string, unitNumber: number, type: 'bedrijfsunit' | 'opslagbox') =>
      track('unit_modal_opened', { unit_name: unitName, unit_number: unitNumber, unit_type: type }),

    // Floorplan interactions
    trackFloorplanUnitClicked: (unitNumber: number, type: 'bedrijfsunit' | 'opslagbox') =>
      track('floorplan_unit_clicked', { unit_number: unitNumber, unit_type: type }),

    trackFloorplanTabChanged: (tab: string) =>
      track('floorplan_tab_changed', { tab }),

    // Conversions
    trackContactFormSubmitted: (formType: 'bezichtiging' | 'unit_contact', unitName?: string, unitNumber?: number) =>
      track('contact_form_submitted', { form_type: formType, unit_name: unitName, unit_number: unitNumber }),

    // Navigation
    trackCategoryChanged: (category: 'bedrijfsunits' | 'opslagboxen') =>
      track('category_changed', { category }),

    trackDownloadClicked: (documentName: string) =>
      track('document_downloaded', { document_name: documentName }),

    // Generic
    track,
  };
}
