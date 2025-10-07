# Spec Requirements Document

> Spec: Dual Color Gradient Mode
> Created: 2025-10-06
> Status: Planning

## Overview

Add a new game mode that displays two colors in a gradient format, requiring players to describe both colors to achieve maximum points.

## User Stories

### Gradient Color Challenge

As a player, I want to describe two colors simultaneously in a gradient display, so that I can challenge myself with more complex color perception tasks.

When the player switches to dual color mode, the screen displays two distinct colors: the first third shows color A, the last third shows color B, and the middle third displays a smooth gradient between them. The player must describe both colors in their input to receive full scoring from the AI, which evaluates the description based on how well both colors are captured.

## Spec Scope

1. **Dual Color Mode Toggle** - Button in bottom-middle of screen to switch between single and dual color modes
2. **Gradient Display** - Screen divided into thirds (color A, gradient, color B) in dual mode
3. **Dual Color Generation** - Generate two random hex colors for gradient mode
4. **Enhanced AI Scoring** - Modified AI prompt to score based on both color descriptions
5. **Mode Persistence** - Remember selected mode in localStorage

## Out of Scope

- Changes to existing single color mode functionality
- Color blending algorithm customization
- More than two colors
- Custom gradient angles or directions

## Expected Deliverable

1. Mode toggle button appears in bottom-middle of screen
2. Clicking toggle switches between single and dual color modes
3. In dual mode, screen shows gradient with two distinct colors
4. AI scoring evaluates both color descriptions in dual mode
5. Mode selection persists across page refreshes

## Spec Documentation

- Tasks: @.agent-os/specs/2025-10-06-dual-color-gradient-mode/tasks.md
- Technical Specification: @.agent-os/specs/2025-10-06-dual-color-gradient-mode/sub-specs/technical-spec.md
- API Specification: @.agent-os/specs/2025-10-06-dual-color-gradient-mode/sub-specs/api-spec.md
- Database Schema: @.agent-os/specs/2025-10-06-dual-color-gradient-mode/sub-specs/database-schema.md
- Tests Specification: @.agent-os/specs/2025-10-06-dual-color-gradient-mode/sub-specs/tests.md
