# Diagnose Tab Content Leak Bugfix Design

## Overview

The Profile and Tips screens each have a back button whose `onclick` handler calls `goBack()` followed by `renderHomeScreen()`. The `goBack()` function pops `State.navHistory` and activates whichever screen was previously visited — which can be `#screen-diagnose` when the user arrived at Profile/Tips via the bottom nav after having visited Diagnose. After `goBack()` activates `#screen-diagnose`, the immediately following `renderHomeScreen()` writes content into `#screen-home`, leaving `#screen-diagnose` visible and still containing stale Profile or Tips HTML from its last render. The fix is to remove the hardcoded `renderHomeScreen()` call from both back buttons and instead call `refreshCurrentScreen()` after `goBack()`, so the correct screen is always re-rendered.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — the back button in Profile or Tips is pressed when `State.navHistory` contains `'diagnose'` as the most-recent entry, causing `goBack()` to activate `#screen-diagnose` while `renderHomeScreen()` writes into `#screen-home`.
- **Property (P)**: The desired behavior — after pressing back from Profile or Tips, only the screen that `goBack()` activates is rendered and visible; no other screen element contains leaked content.
- **Preservation**: All navigation flows that do NOT involve pressing back from Profile/Tips while `navHistory` top is `'diagnose'` must continue to work exactly as before.
- **`goBack()`**: Function in `js/state.js` that pops `State.navHistory`, removes `.active` from the current screen, and adds `.active` to the previous screen.
- **`navigateTo(screenId)`**: Function in `js/state.js` that pushes the current screen onto `State.navHistory` and activates the target screen.
- **`refreshCurrentScreen()`**: Function in `js/app.js` that calls the correct `render*Screen()` function for `State.currentScreen`.
- **`State.navHistory`**: Array of screen IDs representing the navigation stack; `goBack()` pops from it to determine which screen to return to.

## Bug Details

### Bug Condition

The bug manifests when the user presses the back button on the Profile or Tips screen and `State.navHistory` contains `'diagnose'` as the most-recent entry. `goBack()` activates `#screen-diagnose`, but the hardcoded `renderHomeScreen()` call that follows writes content into `#screen-home` instead of re-rendering `#screen-diagnose`. This leaves `#screen-diagnose` visible with whatever HTML was last written into it (Profile or Tips content from a prior render).

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { pressedBackFrom: string, navHistoryTop: string }
  OUTPUT: boolean

  RETURN input.pressedBackFrom IN ['profile', 'tips']
         AND input.navHistoryTop = 'diagnose'
END FUNCTION
```

### Examples

- User visits Diagnose → navigates to Profile via bottom nav → presses back: `goBack()` activates `#screen-diagnose`, then `renderHomeScreen()` writes into `#screen-home`. `#screen-diagnose` is visible but contains Profile HTML. **Expected**: `#screen-diagnose` is visible and contains Diagnose form HTML.
- User visits Diagnose → navigates to Tips via bottom nav → presses back: same race — `#screen-diagnose` is visible but contains Tips HTML. **Expected**: `#screen-diagnose` is visible and contains Diagnose form HTML.
- User visits Home → navigates to Profile via bottom nav → presses back: `goBack()` activates `#screen-home`, then `renderHomeScreen()` writes into `#screen-home`. This works correctly today and must continue to work after the fix.
- User visits Home → navigates to Tips via bottom nav → presses back: same as above — works correctly today and must be preserved.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Pressing back from Profile when the previous screen is Home must continue to navigate to Home and render Home content.
- Pressing back from Tips when the previous screen is Home must continue to navigate to Home and render Home content.
- All bottom-nav tab switches (Home, Diagnose, History, Tips, Profile) must continue to work exactly as before.
- Submitting a diagnosis from the Diagnose screen must continue to navigate to Loading → Results correctly.
- All other back-button flows (e.g., back from Results, back from Add Vehicle) must be unaffected.

**Scope:**
All inputs where `isBugCondition` returns false — i.e., any back-button press where `navHistoryTop` is not `'diagnose'`, or any navigation action that does not involve the Profile/Tips back buttons — must produce exactly the same behavior as before the fix.

## Hypothesized Root Cause

Based on the bug description and code review, the root cause is:

1. **Hardcoded `renderHomeScreen()` in back-button handlers**: Both `renderProfileScreen()` and `renderTipsScreen()` embed `onclick="goBack(); renderHomeScreen();"` in their back button HTML. This assumes the previous screen is always Home, which is incorrect.

2. **`goBack()` activates the actual previous screen**: `goBack()` correctly pops `State.navHistory` and activates whatever screen was previously visited. When that screen is `#screen-diagnose`, it becomes visible — but `renderHomeScreen()` then writes into `#screen-home` instead of re-rendering `#screen-diagnose`.

3. **No re-render of the activated screen**: After `goBack()` activates a screen, nothing re-renders its content. If `#screen-diagnose` was last rendered with Diagnose form HTML, it would be fine — but because `renderProfileScreen()` and `renderTipsScreen()` write into their own `el` (which is `#screen-profile` / `#screen-tips`), the stale content in `#screen-diagnose` is whatever was there from a previous render cycle, which may be Profile or Tips HTML if those screens were ever rendered into the wrong element. Actually, the more direct cause: `renderProfileScreen` writes into `#screen-profile` and `renderTipsScreen` writes into `#screen-tips`, so `#screen-diagnose` retains its last content. The problem is purely that `#screen-diagnose` becomes `.active` (visible) while its content is stale and `renderHomeScreen()` does nothing to fix it.

4. **Fix is minimal**: Replace `goBack(); renderHomeScreen();` with `goBack(); refreshCurrentScreen();` in both back buttons. `refreshCurrentScreen()` reads `State.currentScreen` (which `goBack()` has already updated) and calls the correct render function.

## Correctness Properties

Property 1: Bug Condition - Back Navigation Renders the Correct Screen

_For any_ back-button press from Profile or Tips where `isBugCondition` holds (i.e., `navHistoryTop === 'diagnose'`), the fixed back-button handler SHALL activate `#screen-diagnose` AND render the Diagnose form content into `#screen-diagnose`, leaving no Profile or Tips HTML visible in any active screen element.

**Validates: Requirements 2.3, 2.4**

Property 2: Preservation - Non-Buggy Back Navigation Is Unchanged

_For any_ back-button press from Profile or Tips where `isBugCondition` does NOT hold (i.e., `navHistoryTop !== 'diagnose'`), the fixed back-button handler SHALL produce exactly the same screen activation and rendered content as the original handler, preserving all existing navigation behavior for non-buggy inputs.

**Validates: Requirements 3.1, 3.2, 3.4, 3.5**

## Fix Implementation

### Changes Required

**File**: `js/screens/profile.js`

**Function**: `renderProfileScreen()`

**Specific Changes**:
1. **Replace back-button onclick**: Change `onclick="goBack(); renderHomeScreen();"` to `onclick="goBack(); refreshCurrentScreen();"`.
   - This ensures the screen that `goBack()` activates is always re-rendered with correct content.
   - `refreshCurrentScreen()` reads `State.currentScreen` which `goBack()` has already set to the correct previous screen ID.

---

**File**: `js/screens/tips.js`

**Function**: `renderTipsScreen()`

**Specific Changes**:
1. **Replace back-button onclick**: Change `onclick="goBack(); renderHomeScreen();"` to `onclick="goBack(); refreshCurrentScreen();"`.
   - Same rationale as the Profile fix above.

### Why This Fix Is Minimal and Safe

- `refreshCurrentScreen()` already exists in `js/app.js` and handles all screen IDs in `State.currentScreen`.
- No changes to `goBack()`, `navigateTo()`, or any screen's render logic are required.
- The fix is a two-character-class change in two files, touching only the back-button onclick attributes.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate the navigation sequence (navigate to Diagnose → navigate to Profile/Tips → press back) and assert that `#screen-diagnose` contains Diagnose form HTML (not Profile/Tips HTML) after the back press. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Profile Back from Diagnose**: Set `State.navHistory = ['diagnose']`, call `renderProfileScreen()`, simulate back-button click — assert `#screen-diagnose` contains Diagnose form content (will fail on unfixed code).
2. **Tips Back from Diagnose**: Set `State.navHistory = ['diagnose']`, call `renderTipsScreen()`, simulate back-button click — assert `#screen-diagnose` contains Diagnose form content (will fail on unfixed code).
3. **Profile Back from Home**: Set `State.navHistory = ['home']`, call `renderProfileScreen()`, simulate back-button click — assert `#screen-home` contains Home content (should pass on unfixed code; verifies preservation baseline).
4. **Tips Back from Home**: Set `State.navHistory = ['home']`, call `renderTipsScreen()`, simulate back-button click — assert `#screen-home` contains Home content (should pass on unfixed code; verifies preservation baseline).

**Expected Counterexamples**:
- After back press from Profile with `navHistoryTop = 'diagnose'`: `#screen-diagnose` is `.active` but its `innerHTML` does not contain Diagnose slider/form markup.
- Possible causes: `renderHomeScreen()` wrote into `#screen-home` instead of `#screen-diagnose`; `#screen-diagnose` retains stale content from a prior render.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed handler produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := backButtonHandler_fixed(input)
  ASSERT screenDiagnose.classList.contains('active')
  ASSERT screenDiagnose.innerHTML CONTAINS diagnoseFormMarker
  ASSERT screenProfile.classList NOT CONTAINS 'active'
  ASSERT screenTips.classList NOT CONTAINS 'active'
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed handler produces the same result as the original handler.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT backButtonHandler_original(input) = backButtonHandler_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many navigation history configurations automatically.
- It catches edge cases (empty history, multi-step history) that manual tests might miss.
- It provides strong guarantees that behavior is unchanged for all non-buggy navigation paths.

**Test Plan**: Observe behavior on UNFIXED code for back presses where `navHistoryTop !== 'diagnose'`, capture the resulting active screen and rendered content, then verify the fixed code produces identical results.

**Test Cases**:
1. **Home as Previous Screen**: Verify back from Profile/Tips with `navHistoryTop = 'home'` still activates `#screen-home` and renders Home content.
2. **History as Previous Screen**: Verify back from Profile with `navHistoryTop = 'history'` still activates `#screen-history` and renders History content.
3. **Empty History**: Verify back press with empty `navHistory` does nothing (no crash, no screen change).
4. **Bottom Nav Tabs Unaffected**: Verify all five bottom-nav tab switches continue to activate and render the correct screen.

### Unit Tests

- Test that back button in `renderProfileScreen()` calls `goBack()` then `refreshCurrentScreen()`.
- Test that back button in `renderTipsScreen()` calls `goBack()` then `refreshCurrentScreen()`.
- Test that `refreshCurrentScreen()` calls `renderDiagnoseScreen()` when `State.currentScreen === 'diagnose'`.
- Test edge case: back press with empty `navHistory` does not throw.

### Property-Based Tests

- Generate random `navHistory` stacks and verify that after back press from Profile, the activated screen's content matches what `refreshCurrentScreen()` would render for that screen ID.
- Generate random `navHistory` stacks and verify that after back press from Tips, the activated screen's content matches what `refreshCurrentScreen()` would render for that screen ID.
- Verify that for any `navHistoryTop !== 'diagnose'`, the fixed and original handlers produce the same active screen element.

### Integration Tests

- Full flow: Home → Diagnose (via nav) → Profile (via nav) → back → assert Diagnose screen is active with Diagnose form content.
- Full flow: Home → Diagnose (via nav) → Tips (via nav) → back → assert Diagnose screen is active with Diagnose form content.
- Full flow: Home → Profile (via nav) → back → assert Home screen is active with Home content (regression check).
- Full flow: Home → Tips (via nav) → back → assert Home screen is active with Home content (regression check).
- Verify bottom nav highlight is correct after each back navigation.
