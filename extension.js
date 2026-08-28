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
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class Speedinator extends Extension {

    #overviewShownId = null;
    #originalToggle = null;
    #originalSpeed = null;
    #timeoutId = null;
    #settings = null;

    constructor(metadata) {
        super(metadata);
    }

    enable() {
        this.#originalToggle = Overview.Overview.prototype.toggle;
        this.#originalSpeed = St.Settings.get().slow_down_factor;
        this.#settings = this.getSettings('org.gnome.shell.extensions.moe.liam.speedinator');
        St.Settings.get().slow_down_factor = this.#originalSpeed * this.#settings.get_value('speed').get_double();
        this.#settings.connect('changed::speed', (settings, key) => {
            const mod = settings.get_value(key).get_double();
            St.Settings.get().slow_down_factor = this.#originalSpeed * mod;
        });

        this.#overviewShownId = Main.overview.connect('shown', this.#onOverviewShown.bind(this));
    }

    disable() {
        this.#settings = null;
        Main.overview.disconnect(this.#overviewShownId);
        this.#stopListening();
        St.Settings.get().slow_down_factor = this.#originalSpeed;
    }

    #onOverviewShown() {

        this.#stopListening();
        this.#originalToggle = Overview.Overview.prototype.toggle;
        Overview.Overview.prototype.toggle = () => {
            GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                // show apps grid
                Main.overview._overview.animateToOverview(OverviewControls.ControlsState.APP_GRID);
                this.#stopListening();
                return GLib.SOURCE_REMOVE;
            });

        }

        const gracePeriod = this.#settings.get_value('app-grid-grace-period').get_int32();

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