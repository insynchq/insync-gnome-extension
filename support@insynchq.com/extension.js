const St = imports.gi.St
const Main = imports.ui.main
const Util = imports.misc.util
const Me = imports.misc.extensionUtils.getCurrentExtension()
const Gio = imports.gi.Gio

const insyncIcon = Gio.icon_new_for_string(Me.path + '/icons/normal.png')
const icon = new St.Icon({gicon: insyncIcon, style_class: 'insync-icon'})
let button

function _toggleInsync () {
  Util.spawn(['/usr/bin/insync', 'toggle'])
}

function init() {
  button = new St.Bin({ style_class: 'panel-button',
                        reactive: true,
                        can_focus: true,
                        x_fill: true,
                        y_fill: true,
                        track_hover: true })

  button.set_child(icon)
  button.connect('button-press-event', _toggleInsync)
}

function enable() {
  Main.panel._rightBox.insert_child_at_index(button, 0)
}

function disable() {
  Main.panel._rightBox.remove_child(button)
}
