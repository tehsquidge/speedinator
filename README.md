# Speedinator

Speedinator is a GNOME Shell extension that allows users to adjust the speed of system animations. It is a refactored fork of the *Impatience* extension, updated to support **GNOME 45 and later**.

## Features

* **Animation Scaling:** Adjust the global speed of GNOME Shell animations (e.g., Overview transitions, and virtual desktop movements).
* **Grace Period:** Adjustable grace period in which the app grid can still be activated (#3) to compensate for the lost time caused by speeding up animations.
* **Granular Presets:** Includes various speed multipliers, such as 0.75x for subtle acceleration.
* **ESM Compatibility:** Fully compliant with the ECMAScript Modules (ESM) architecture required by modern GNOME versions.

## Installation

### Via GNOME Extensions
The most stable version is available on the [GNOME Extensions website](https://extensions.gnome.org/extension/6397/speedinator/).

### Manual Installation
1. Clone the repository:
   ```bash
   git clone git@github.com:tehsquidge/speedinator.git
2. Move the extension directory to the local extensions folder:
    ```
    mkdir -p ~/.local/share/gnome-shell/extensions/
    cp -r speedinator ~/.local/share/gnome-shell/extensions/speedinator@liam.moe

    Restart the GNOME Shell (Log out and log back in, or use Alt+F2 > r > Enter on X11).

    Enable the extension via GNOME Extensions or Extension Manager.

### Configuration

Options can be accessed through the extension's settings:
  1. Open the Extensions app.
  2. Navigate to Speedinator.
  3. Select the preferred animation speed.
