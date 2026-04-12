# Bugfix Requirements Document

## Introduction

The Diagnose tab in the vehicle diagnostics PWA incorrectly displays content belonging to the Profile and Tips screens. When a user navigates to the Diagnose tab, they see Profile settings (account info, badges, preferences) and/or Tips articles rendered inside the diagnose view instead of — or alongside — the expected vehicle diagnostic form. This content leak degrades the user experience and makes the Diagnose tab unusable for its intended purpose.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the user navigates to the Diagnose tab (via bottom nav or home CTA) THEN the system renders Profile screen content (account info, badges, settings) inside the Diagnose tab view.

1.2 WHEN the user navigates to the Diagnose tab (via bottom nav or home CTA) THEN the system renders Tips screen content (articles, category pills, seasonal tips) inside the Diagnose tab view.

1.3 WHEN the user presses the back button from the Profile screen THEN the system activates the Diagnose screen element while rendering Home screen content, leaving the Diagnose tab visible with stale or mismatched content.

1.4 WHEN the user presses the back button from the Tips screen THEN the system activates the Diagnose screen element while rendering Home screen content, leaving the Diagnose tab visible with stale or mismatched content.

### Expected Behavior (Correct)

2.1 WHEN the user navigates to the Diagnose tab THEN the system SHALL render only the vehicle diagnostic form (sliders, symptom input, submit CTA) inside `#screen-diagnose`.

2.2 WHEN the user navigates to the Diagnose tab THEN the system SHALL NOT render any Profile or Tips content inside `#screen-diagnose`.

2.3 WHEN the user presses the back button from the Profile screen THEN the system SHALL navigate to the correct previous screen and render only that screen's content.

2.4 WHEN the user presses the back button from the Tips screen THEN the system SHALL navigate to the correct previous screen and render only that screen's content.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user navigates to the Profile tab THEN the system SHALL CONTINUE TO render Profile content exclusively inside `#screen-profile`.

3.2 WHEN the user navigates to the Tips tab THEN the system SHALL CONTINUE TO render Tips content exclusively inside `#screen-tips`.

3.3 WHEN the user submits a diagnosis from the Diagnose tab THEN the system SHALL CONTINUE TO navigate to the loading and results screens correctly.

3.4 WHEN the user navigates between any two tabs THEN the system SHALL CONTINUE TO show only the active screen's content and hide all other screens.

3.5 WHEN the user is on the Home screen THEN the system SHALL CONTINUE TO render Home content exclusively inside `#screen-home`.
