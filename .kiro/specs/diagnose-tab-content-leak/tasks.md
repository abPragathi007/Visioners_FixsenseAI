# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Back Navigation Renders Wrong Screen Content
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the two concrete failing cases: back from Profile with `navHistoryTop = 'diagnose'`, and back from Tips with `navHistoryTop = 'diagnose'`
  - Set up a minimal DOM with `#screen-home`, `#screen-diagnose`, `#screen-profile`, `#screen-tips` elements
  - **Test case A**: Set `State.navHistory = ['diagnose']`, call `renderProfileScreen()`, simulate back-button click — assert `#screen-diagnose` has class `active` AND its `innerHTML` contains Diagnose form markup (e.g. a slider or `screen-diagnose` content marker), NOT Profile HTML
  - **Test case B**: Set `State.navHistory = ['diagnose']`, call `renderTipsScreen()`, simulate back-button click — assert `#screen-diagnose` has class `active` AND its `innerHTML` contains Diagnose form markup, NOT Tips HTML
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bug exists)
  - Document counterexamples found (e.g. "`#screen-diagnose` is `.active` but contains Profile settings HTML instead of Diagnose form HTML")
  - Mark task complete when tests are written, run, and failure is documented
  - _Requirements: 1.3, 1.4, 2.3, 2.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Back Navigation Is Unchanged
  - **IMPORTANT**: Follow observation-first methodology — run UNFIXED code first, observe outputs, then encode as tests
  - Observe: back from Profile with `navHistoryTop = 'home'` activates `#screen-home` and renders Home content on unfixed code
  - Observe: back from Tips with `navHistoryTop = 'home'` activates `#screen-home` and renders Home content on unfixed code
  - Observe: back from Profile with `navHistoryTop = 'history'` activates `#screen-history` on unfixed code
  - Observe: back press with empty `navHistory` does nothing (no crash, no screen change) on unfixed code
  - Write property-based tests: for all `navHistoryTop` values NOT equal to `'diagnose'` (e.g. `'home'`, `'history'`, `'results'`, `''`), the back-button handler activates the correct previous screen and renders its content — same as the original handler
  - Verify all preservation tests PASS on UNFIXED code before proceeding
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 3. Fix back-button handlers in Profile and Tips screens

  - [x] 3.1 Replace `renderHomeScreen()` with `refreshCurrentScreen()` in `js/screens/profile.js`
    - In `renderProfileScreen()`, locate the back button: `onclick="goBack(); renderHomeScreen();"`
    - Replace with: `onclick="goBack(); refreshCurrentScreen();"`
    - `goBack()` already updates `State.currentScreen` to the correct previous screen ID before returning
    - `refreshCurrentScreen()` reads `State.currentScreen` and calls the matching `render*Screen()` function
    - _Bug_Condition: isBugCondition(input) where input.pressedBackFrom = 'profile' AND input.navHistoryTop = 'diagnose'_
    - _Expected_Behavior: #screen-diagnose is active and contains Diagnose form HTML; no Profile HTML is visible in any active screen_
    - _Preservation: All back-button presses where navHistoryTop !== 'diagnose' must produce the same active screen and rendered content as before_
    - _Requirements: 2.3, 3.1, 3.4_

  - [x] 3.2 Replace `renderHomeScreen()` with `refreshCurrentScreen()` in `js/screens/tips.js`
    - In `renderTipsScreen()`, locate the back button: `onclick="goBack(); renderHomeScreen();"`
    - Replace with: `onclick="goBack(); refreshCurrentScreen();"`
    - Same rationale as 3.1 — `refreshCurrentScreen()` dispatches to the correct render function for whatever screen `goBack()` activated
    - _Bug_Condition: isBugCondition(input) where input.pressedBackFrom = 'tips' AND input.navHistoryTop = 'diagnose'_
    - _Expected_Behavior: #screen-diagnose is active and contains Diagnose form HTML; no Tips HTML is visible in any active screen_
    - _Preservation: All back-button presses where navHistoryTop !== 'diagnose' must produce the same active screen and rendered content as before_
    - _Requirements: 2.4, 3.2, 3.4_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Back Navigation Renders Correct Screen Content
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior (correct Diagnose content after back from Profile/Tips)
    - When these tests pass, it confirms the fix satisfies the expected behavior
    - Run both test cases (Profile back from Diagnose, Tips back from Diagnose) from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms bug is fixed)
    - _Requirements: 2.3, 2.4_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Back Navigation Is Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2 against the fixed code
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm back from Profile/Tips to Home, History, and other non-diagnose screens still works correctly
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 4. Checkpoint — Ensure all tests pass
  - Re-run the full test suite (exploration test + preservation tests)
  - Manually verify the end-to-end flow: Home → Diagnose (via nav) → Profile (via nav) → back → confirm Diagnose screen is active with Diagnose form content
  - Manually verify: Home → Diagnose (via nav) → Tips (via nav) → back → confirm Diagnose screen is active with Diagnose form content
  - Manually verify regression: Home → Profile (via nav) → back → confirm Home screen is active with Home content
  - Manually verify regression: Home → Tips (via nav) → back → confirm Home screen is active with Home content
  - Ensure all tests pass; ask the user if any questions arise
