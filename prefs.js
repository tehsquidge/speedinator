import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class SpeedinatorPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
		const settings = this.getSettings();

        // Create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic'
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Behaviour'),
            description: _('Configure the behaviour of the extension'),
        });

		let adjustment = new Gtk.Adjustment({
			lower: 0.15,
			upper: 1.5,
			step_increment: 0.05
		});
		let hbox = new Gtk.Box({
			orientation: Gtk.Orientation.HORIZONTAL,
			spacing: 20
		});

		let label = new Gtk.Label({
			label: _('Speed scaling\n<small>(1 = normal, 0.5 = twice as fast)</small>'),
			use_markup: true,
		});


		let scale = new Gtk.Scale({
			orientation: Gtk.Orientation.HORIZONTAL,
			digits:2,
			adjustment: adjustment,
			hexpand: true,
			value_pos: Gtk.PositionType.RIGHT
		});

		hbox.append(label);
		hbox.append(scale);
		group.add(hbox);
		page.add(group);

		[0.25, 0.5, 0.75, 1.0, 2.0].forEach(
			mark => scale.add_mark(mark, Gtk.PositionType.TOP, "<small>" + mark + "</small>")
		);
		scale.set_value(settings.get_double("speed"));
		scale.connect('value-changed', (sw) => {
			settings.set_double("speed", sw.get_value());
		});
    }
}
