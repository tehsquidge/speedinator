import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import {
    ExtensionPreferences,
    gettext as _
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class SpeedinatorPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic'
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Behaviour'),
            description: _('Configure the extension behavior')
        });
        page.add(group);

        const speedRow = new Adw.ActionRow({
            title: _('Speed'),
            subtitle: _('1 = normal, 0.5 = twice as fast'),
        });

        const speedScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            digits: 2,
            adjustment: new Gtk.Adjustment({
                lower: 0.0,
                upper: 2.0,
                step_increment: 0.05
            }),
            width_request: 300,
            valign: Gtk.Align.CENTER,
            draw_value: true,
            value_pos: Gtk.PositionType.RIGHT
        });

        [0.25, 0.5, 0.75, 1.0, 1.5, 2.0].forEach(m => 
            speedScale.add_mark(m, Gtk.PositionType.TOP, null)
        );

        settings.bind('speed', speedScale.get_adjustment(), 'value', Gio.SettingsBindFlags.DEFAULT);
        
        speedRow.add_suffix(speedScale);
        group.add(speedRow);

        const graceRow = new Adw.SpinRow({
            title: _('App Grid Grace Period'),
            subtitle: _('Extra time (ms) to switch to app grid'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 10000,
                step_increment: 50,
                page_increment: 500
            })
        });

        settings.bind('app-grid-grace-period', graceRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        
        group.add(graceRow);
    }
}