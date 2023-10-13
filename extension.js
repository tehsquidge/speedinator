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
import GObject from 'gi://GObject';

import St from 'gi://St';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class Speedinator extends Extension {
    enable() {
        this._original_speed = St.Settings.get().slow_down_factor;
        this._settings = this.getSettings('org.gnome.shell.extensions.moe.liam.speedinator');
        St.Settings.get().slow_down_factor = this._original_speed * this._settings.get_value('speed').get_double();
        this._settings.connect('changed::speed', (settings, key) => {
            const mod = settings.get_value(key).get_double();
            St.Settings.get().slow_down_factor = this._original_speed * mod
        });
    }

    disable() {
        this._settings = null;
        St.Settings.get().slow_down_factor = this._original_speed;
    }
}
