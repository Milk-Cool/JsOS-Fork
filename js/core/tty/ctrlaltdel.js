module.exports = () => {
  debug("Ctrl+Alt+Del pressed, rebooting");
  $$.machine.reboot();
}
