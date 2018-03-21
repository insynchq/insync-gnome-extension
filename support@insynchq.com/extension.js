const St = imports.gi.St
const Main = imports.ui.main
const Gio = imports.gi.Gio
const GLib = imports.gi.GLib

let onlineIcon
let offlineIcon
let socketPath
let button
let checkStatusTimeout
let showInsyncTimeout

function _getIcon (path) {
  var Me = imports.misc.extensionUtils.getCurrentExtension()
  return Gio.icon_new_for_string(Me.path + path)
}

function _callCmd (cmd) {
  return GLib.spawn_command_line_sync(cmd)[1].toString().trim()
}

function _isRunning () {
  // check if running
  // if socket file exists
  if (_callCmd('ls ' + socketPath) === socketPath) {
    return true
  }
  return false
}

function _showInsync () {
  var status = _callCmd('insync get_status')

  if (status === 'UNLINKED' || !_isRunning()) {
    return true
  }

  _callCmd('insync show')
  return false
}

function _toggleInsync () {
  if (!_isRunning()) {
    _callCmd('insync start')

    if (showInsyncTimeout) {
      GLib.source_remove(showInsyncTimeout)
    }
    // timeout_add will keep on running until its function returns false
    showInsyncTimeout = GLib.timeout_add(null, 1000, _showInsync)
  } else {
    _callCmd('insync toggle')
  }
}

function _checkStatus () {
  if (_isRunning()) {
    button.set_child(onlineIcon)
  } else {
    button.set_child(offlineIcon)
  }
  return true
}

function init () {

}

function enable () {
  onlineIcon = new St.Icon({gicon: _getIcon('/icons/normal.png'), style_class: 'insync-icon'})
  offlineIcon = new St.Icon({gicon: _getIcon('/icons/offline.png'), style_class: 'insync-icon'})

  socketPath = '/tmp/insync' + _callCmd('id -u') + '.sock'
  checkStatusTimeout = GLib.timeout_add(null, 1000, _checkStatus)

  button = new St.Bin({ style_class: 'panel-button',
    reactive: true,
    can_focus: true,
    x_fill: true,
    y_fill: true,
    track_hover: true })

  button.connect('button-press-event', _toggleInsync)
  Main.panel._rightBox.insert_child_at_index(button, 0)
}

function disable () {
  Main.panel._rightBox.remove_child(button)
  GLib.source_remove(checkStatusTimeout)
}
