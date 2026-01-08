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

    constructor(metadata) {
        super(metadata);
        this._overviewShownId = null;
        this._originalToggle = null;
        this._timeoutId = null;
    }

    enable() {
        this._originalToggle = Overview.Overview.prototype.toggle;
        this._original_speed = St.Settings.get().slow_down_factor;
        this._settings = this.getSettings('org.gnome.shell.extensions.moe.liam.speedinator');
        St.Settings.get().slow_down_factor = this._original_speed * this._settings.get_value('speed').get_double();
        this._settings.connect('changed::speed', (settings, key) => {
            const mod = settings.get_value(key).get_double();
            St.Settings.get().slow_down_factor = this._original_speed * mod
        });

        this._overviewShownId = Main.overview.connect('shown', this._onOverviewShown.bind(this));
    }

    disable() {
        this._settings = null;
        Main.overview.disconnect(this._overviewShownId);
        this._stopListening();
        St.Settings.get().slow_down_factor = this._original_speed;
    }

    _onOverviewShown() {

        this._stopListening();
        this._originalToggle = Overview.Overview.prototype.toggle;
        Overview.Overview.prototype.toggle = () => {
            console.log("Toggling overview via Speedinator");
            GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                // show apps grid
                Main.overview._overview.animateToOverview(OverviewControls.ControlsState.APP_GRID);
                this._stopListening();
                return GLib.SOURCE_REMOVE;
            });

        } 

        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, this._calcListeningWindow(), () => {
            this._stopListening();
            return GLib.SOURCE_REMOVE;
        });
    }

    _calcListeningWindow() {
        return 250;
    }

    _stopListening() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
        Overview.Overview.prototype.toggle = this._originalToggle;
    }
}