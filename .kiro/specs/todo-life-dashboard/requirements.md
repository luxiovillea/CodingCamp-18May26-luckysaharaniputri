# Requirements Document

## Introduction

The To-Do Life Dashboard is a single-page web application built with HTML, CSS, and Vanilla JavaScript. It serves as a personal productivity hub that combines a live clock and contextual greeting, a configurable focus timer, a persistent to-do list, and a quick-access link collection — all stored locally in the browser with no backend required. The application supports both dark and light themes and persists all user data across sessions via `localStorage`.

---

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Clock**: The live digital display showing the current time (HH:MM:SS).
- **Greeting**: The time-of-day salutation and personalized name shown in the header.
- **Focus_Timer**: The countdown timer widget used to track focused work sessions.
- **Session**: A single countdown interval from the configured duration to zero.
- **Task**: A single to-do item stored in the to-do list.
- **Task_List**: The ordered collection of Tasks displayed in the to-do card.
- **Quick_Link**: A user-defined URL with a display label stored in the links card.
- **Links_Collection**: The set of all Quick_Links saved by the user.
- **LocalStorage**: The browser's `localStorage` API used for client-side persistence.
- **Theme**: The visual color scheme of the Dashboard, either `dark` or `light`.
- **Toast**: A brief, non-blocking notification message shown at the bottom of the screen.
- **Progress_Bar**: The visual indicator showing the ratio of completed Tasks to total Tasks.
- **Favicon**: The small icon fetched from a website's domain to represent a Quick_Link.
- **Sort_Mode**: The active ordering strategy applied to the Task_List (`default`, `alpha`, or `done`).

---

## Requirements

### Requirement 1: Live Clock and Contextual Greeting

**User Story:** As a user, I want to see the current time, date, and a personalized greeting, so that I have immediate temporal context when I open the Dashboard.

#### Acceptance Criteria

1. THE Clock SHALL display the current local time in HH:MM:SS format, updating every second via a `setInterval` callback.
2. WHEN the Dashboard loads and on each subsequent clock tick, THE Greeting SHALL display the time-of-day salutation according to the current local hour: "Good night" for hours 0–4 and 21–23, "Good morning" for hours 5–11, "Good afternoon" for hours 12–16, and "Good evening" for hours 17–20.
3. THE Dashboard SHALL display the full current date formatted as weekday, month, day, and year (e.g., "Monday, July 14, 2025") using `toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })`.
4. WHEN a user name has been saved and does not exceed 50 characters, THE Greeting SHALL display the saved name in the header salutation.
5. WHEN no user name has been saved, THE Greeting SHALL display "Friend" as the default name.
6. THE Dashboard SHALL display a daily motivational quote selected by the formula `(dayOfWeek + dayOfMonth) % QUOTES.length`, where `dayOfWeek` is `Date.getDay()` (0–6) and `dayOfMonth` is `Date.getDate()` (1–31), ensuring the same quote is shown for the entire calendar day.

---

### Requirement 2: User Name Personalization

**User Story:** As a user, I want to set my name so that the Dashboard greets me personally.

#### Acceptance Criteria

1. WHEN the Dashboard loads and no user name is stored in LocalStorage, THE Dashboard SHALL display a name-entry modal with the name input focused.
2. WHEN the user submits a non-empty name (not solely whitespace) of at most 30 characters via the modal, THE Dashboard SHALL trim the name, save it to LocalStorage under the key `userName`, and dismiss the modal.
3. WHEN the user submits the modal form by pressing the Enter key, THE Dashboard SHALL treat it as a save action equivalent to clicking the save button.
4. IF the user submits an empty name or a name consisting solely of whitespace, THEN THE Dashboard SHALL retain the modal in its visible state, display a visual error indication on the input field, and keep "Friend" as the displayed name.
5. WHEN the Dashboard loads and a user name is stored in LocalStorage, THE Dashboard SHALL display the stored name without showing the modal.

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a configurable countdown timer with start, pause, and reset controls, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL default to a 25-minute countdown duration on first load when no value is stored in LocalStorage.
2. WHEN the user clicks Start and the timer is not already running, THE Focus_Timer SHALL begin counting down from the current remaining time, decrementing by one second per `setInterval` tick.
3. WHEN the user clicks Pause while the timer is running, THE Focus_Timer SHALL clear the interval, set `isRunning` to false, and preserve the remaining time unchanged.
4. WHEN the user clicks Reset, THE Focus_Timer SHALL clear any active interval, set `isRunning` to false, and restore `secondsLeft` to `totalSeconds`.
5. WHEN the countdown reaches zero, THE Focus_Timer SHALL clear the interval, set `isRunning` to false, and display the text "DONE! 🎉" in the mode label as the completion indicator.
6. WHEN the user applies a new duration between 1 and 120 minutes (inclusive), THE Focus_Timer SHALL set `totalSeconds` to the new value × 60, reset `secondsLeft` to `totalSeconds`, clear any active interval, set `isRunning` to false, and persist the integer minute value to LocalStorage under the key `pomoDuration`.
7. IF the user enters a duration outside the range of 1 to 120 minutes, THEN THE Focus_Timer SHALL display a Toast notification with the message "Enter 1–120 minutes" and leave `totalSeconds` and `secondsLeft` unchanged.
8. THE Focus_Timer SHALL display the remaining time as MM:SS, with both fields zero-padded to two digits.
9. THE Focus_Timer SHALL render a circular SVG progress ring whose `stroke-dashoffset` equals `CIRCUMFERENCE × (1 − secondsLeft / totalSeconds)`, where `CIRCUMFERENCE = 2π × 88`, so the ring depletes clockwise as time elapses.
10. WHEN the Dashboard loads, THE Focus_Timer SHALL restore the last saved duration from LocalStorage under the key `pomoDuration`, falling back to 25 if the key is absent or the stored value is not a valid integer.

---

### Requirement 4: To-Do List

**User Story:** As a user, I want to add, complete, edit, delete, and sort tasks, so that I can track and manage my work items.

#### Acceptance Criteria

1. WHEN the user submits a non-empty task text of at most 120 characters, THE Task_List SHALL add a new Task object with a unique `id` (timestamp), the trimmed text, `done: false`, and an `order` value equal to the current maximum `order` plus one (or 0 for the first task).
2. WHEN the user submits a task text that matches an existing Task's text (case-insensitive, after trimming), THE Task_List SHALL display a Toast notification with the message "Duplicate task — already in your list!" and reject the input without adding a new Task.
3. WHEN the user presses Enter in the task input field, THE Task_List SHALL treat it as equivalent to clicking the add button.
4. WHEN the user clicks the completion toggle on a Task, THE Task_List SHALL invert the Task's `done` boolean and persist the updated tasks array to LocalStorage.
5. WHEN the user clicks the delete button on a Task, THE Task_List SHALL remove the Task from the array and persist the updated tasks array to LocalStorage.
6. WHEN the user commits an inline edit (by pressing Enter or removing focus) and the new text is non-empty and not a duplicate of another Task, THE Task_List SHALL update the Task's `text` field and persist the change to LocalStorage.
7. IF the user clears a Task's text during inline editing and commits the edit, THEN THE Task_List SHALL restore the original text without modifying LocalStorage.
8. IF the user edits a Task's text to match an existing Task (case-insensitive), THEN THE Task_List SHALL display a Toast notification with the message "Task already exists!" and restore the original text without modifying LocalStorage.
9. WHEN the Sort_Mode is set to "Added" (`default`), THE Task_List SHALL order Tasks by their `order` field ascending.
10. WHEN the Sort_Mode is set to "A–Z" (`alpha`), THE Task_List SHALL order Tasks alphabetically by `text` using `localeCompare`.
11. WHEN the Sort_Mode is set to "Done last" (`done`), THE Task_List SHALL order incomplete Tasks (`done: false`) before completed Tasks (`done: true`), preserving relative insertion order within each group.
12. WHEN the user selects a Sort_Mode, THE Task_List SHALL persist the selected Sort_Mode string to LocalStorage under the key `sortMode`.
13. THE Progress_Bar SHALL display the percentage of completed Tasks relative to total Tasks, rounded to the nearest whole number, updating after every add, delete, or toggle action; WHEN the Task_List is empty, THE Progress_Bar SHALL display 0%.
14. THE Task_List SHALL display a count summary in the format "X/Y tasks done" (using "task" when Y equals 1, "tasks" otherwise), updating after every add, delete, or toggle action.
15. WHEN the Task_List is empty, THE Task_List SHALL display the empty-state message "No tasks yet — add one above!".
16. WHEN the Dashboard loads, THE Task_List SHALL restore all Tasks and the Sort_Mode from LocalStorage, falling back to an empty array and `default` sort respectively if the keys are absent or contain malformed data.
17. WHEN the user commits an inline edit by pressing the Enter key, THE Task_List SHALL call `blur()` on the editable element to trigger the `blur` event handler that performs the save.

---

### Requirement 5: Quick Links

**User Story:** As a user, I want to save and access frequently visited URLs with custom labels, so that I can navigate to important sites quickly.

#### Acceptance Criteria

1. WHEN the user submits a non-empty label and a non-empty URL, THE Links_Collection SHALL add a new Quick_Link object with a unique `id` (timestamp), the trimmed label, and the normalized URL.
2. WHEN a submitted URL does not begin with `http://` or `https://` (case-insensitive), THE Links_Collection SHALL prepend `https://` before attempting validation.
3. IF the normalized URL cannot be parsed by `new URL()`, THEN THE Links_Collection SHALL display a Toast notification with the message "Invalid URL" and reject the input without adding a Quick_Link.
4. IF the user submits without providing both a non-empty label and a non-empty URL, THEN THE Links_Collection SHALL display a Toast notification with the message "Please enter both a label and a URL" and reject the input.
5. WHEN the user presses Enter in the URL input field, THE Links_Collection SHALL treat it as equivalent to clicking the add button.
6. WHEN the user clicks the delete button on a Quick_Link, THE Links_Collection SHALL remove the Quick_Link from the array and persist the updated array to LocalStorage under the key `links`.
7. THE Links_Collection SHALL render each Quick_Link as an `<a>` element with `target="_blank"` and `rel="noopener noreferrer"` that opens the URL in a new browser tab.
8. THE Links_Collection SHALL attempt to display a Favicon for each Quick_Link by setting the `src` of an `<img>` element to `https://www.google.com/s2/favicons?sz=32&domain={hostname}`, where `{hostname}` is derived from `new URL(link.url).hostname`.
9. IF a Favicon `<img>` element fires an `onerror` event, THEN THE Links_Collection SHALL set `img.style.display = 'none'` to hide the broken image.
10. WHEN the Dashboard loads, THE Links_Collection SHALL restore all Quick_Links from LocalStorage under the key `links`, falling back to the default set of 8 links (GitHub, Google, YouTube, ChatGPT, Notion, Figma, LinkedIn, Canva) if the key is absent or contains malformed data.

---

### Requirement 6: Theme Switching

**User Story:** As a user, I want to toggle between dark and light themes, so that I can use the Dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHEN the user clicks the theme toggle button, THE Dashboard SHALL toggle the `data-theme` attribute on the `<html>` element between the values `"dark"` and `"light"`.
2. WHEN the theme changes, THE Dashboard SHALL persist the new theme string to LocalStorage under the key `theme`.
3. WHEN the Dashboard loads, THE Dashboard SHALL read the `theme` key from LocalStorage and apply it via `applyTheme()`, defaulting to `"dark"` if the key is absent.
4. WHILE the `data-theme` attribute is `"dark"`, THE Dashboard SHALL display the Unicode character `☀` (U+2600) in the theme toggle button's icon element.
5. WHILE the `data-theme` attribute is `"light"`, THE Dashboard SHALL display the Unicode character `☾` (U+263E) in the theme toggle button's icon element.
6. IF LocalStorage is unavailable when reading the theme preference, THEN THE Dashboard SHALL silently default to `"dark"` without surfacing an error to the user.

---

### Requirement 7: Data Persistence

**User Story:** As a user, I want my tasks, links, timer settings, name, and theme preference to survive page reloads, so that I do not lose my data between sessions.

#### Acceptance Criteria

1. WHEN the user adds, edits, toggles, or deletes a Task, THE Dashboard SHALL immediately call `LS.set('tasks', tasks)` to persist the updated tasks array to LocalStorage.
2. WHEN the user adds or deletes a Quick_Link, THE Dashboard SHALL immediately call `LS.set('links', links)` to persist the updated links array to LocalStorage.
3. WHEN the user applies a new valid Focus_Timer duration, THE Dashboard SHALL call `LS.set('pomoDuration', mins)` to persist the integer minute value to LocalStorage.
4. WHEN the user saves a name via the modal, THE Dashboard SHALL call `LS.set('userName', name)` to persist the trimmed name string to LocalStorage.
5. WHEN the user changes the Sort_Mode, THE Dashboard SHALL call `LS.set('sortMode', sortMode)` to persist the sort mode string to LocalStorage.
6. WHEN the user toggles the theme, THE Dashboard SHALL call `LS.set('theme', theme)` to persist the theme string to LocalStorage.
7. IF a `localStorage.getItem` call throws an exception or returns a value that `JSON.parse` cannot parse, THEN THE Dashboard SHALL return the caller-supplied fallback value without re-throwing the error.
8. WHEN the Dashboard loads, THE Dashboard SHALL restore each data key from LocalStorage using the following defaults: tasks → `[]`, links → default 8-link array, pomoDuration → `25`, userName → `null`, sortMode → `'default'`, theme → `'dark'`.

---

### Requirement 8: Responsive Layout

**User Story:** As a user, I want the Dashboard to be usable on both desktop and mobile screen sizes, so that I can access it from any device.

#### Acceptance Criteria

1. WHILE the viewport width is greater than 780px, THE Dashboard SHALL display the Focus_Timer card in a left column spanning two rows, with the Task_List card and Links card stacked vertically in a right column.
2. IF the viewport width is 780px or less, THEN THE Dashboard SHALL collapse to a single-column layout, stacking cards in the order: Focus_Timer → Task_List → Links.
3. THE Dashboard SHALL set heading and clock font sizes using `clamp()` with viewport-relative units so that text does not overflow its container on screens as narrow as 320px.
