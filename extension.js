/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import GLib from 'gi://GLib';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Overview from 'resource:///org/gnome/shell/ui/overview.js';
import * as OverviewControls from 'resource:///org/gnome/shell/ui/overviewControls.js';
import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
export default class Speedinator extends Extension {

    #originalToggle = null;
    #originalSpeed = null;
    #settings = null;
    #stSettings = null;

    #timeoutId = null;
    #overviewShownId = null;
    #speedChangeId = null;
    #motionChangedId = null;

    constructor(metadata) {
        super(metadata);
    }

    enable() {
        this.#stSettings = St.Settings.get();
        this.#originalToggle = Overview.Overview.prototype.toggle;
        this.#originalSpeed = this.#stSettings.slow_down_factor;
        this.#settings = this.getSettings('org.gnome.shell.extensions.moe.liam.speedinator');

        this.#speedChangeId = this.#settings.connect('changed::speed', () => {
            this.#updateSpeed();
        });

        if (this.#canReduceMotion()) {
            this.#motionChangedId = this.#stSettings.connect('changed::reducedMotion', () => {
                this.#updateSpeed();
            });
        }

        this.#updateSpeed();

        this.#overviewShownId = Main.overview.connect('shown', this.#onOverviewShown.bind(this));
    }

    disable() {
        Main.overview.disconnect(this.#overviewShownId);
        this.#settings.disconnect(this.#speedChangeId);
        if (this.#motionChangedId) {
            this.#stSettings.disconnect(this.#motionChangedId);
        }

        this.#stopListening();

        this.#stSettings.slow_down_factor = this.#originalSpeed;
        this.#settings = null;
        this.#stSettings = null;
        this.#overviewShownId = null;
        this.#originalToggle = null;
        this.#originalSpeed = null;
        this.#timeoutId = null;
    }

    #updateSpeed() {
        const reduced = this.#canReduceMotion() && this.#stSettings.reducedMotion === St.ReducedMotion.REDUCE;
        if (reduced) {
            this.#stSettings.slow_down_factor = this.#originalSpeed;
        } else {
            const mod = this.#settings.get_double('speed');
            this.#stSettings.slow_down_factor = this.#originalSpeed * mod;
        }
    }

    #canReduceMotion() {
        return 'reducedMotion' in this.#stSettings;
    }

    #onOverviewShown() {
        const reduced = this.#canReduceMotion() && this.#stSettings.reducedMotion === St.ReducedMotion.REDUCE;
        if (reduced) {
            this.#stopListening();
            return;
        }

        this.#stopListening();
        Overview.Overview.prototype.toggle = () => {
            GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                Main.overview._overview.animateToOverview(OverviewControls.ControlsState.APP_GRID);
                this.#stopListening();
                return GLib.SOURCE_REMOVE;
            });
        };

        const gracePeriod = this.#settings.get_int('app-grid-grace-period');

        this.#timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, gracePeriod, () => {
            this.#stopListening();
            return GLib.SOURCE_REMOVE;
        });
    }

    #stopListening() {
        if (this.#timeoutId) {
            GLib.source_remove(this.#timeoutId);
            this.#timeoutId = null;
        }
        Overview.Overview.prototype.toggle = this.#originalToggle;
    }
}