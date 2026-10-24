import Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib";
import Gdk from "gi://Gdk?version=4.0";

import { createPoll } from "ags/time"

export default function Button_system(){
    const display = Gdk.Display.get_default();
    if (display) {
        const iconTheme = Gtk.IconTheme.get_for_display(display);
        iconTheme.add_search_path(GLib.get_current_dir() + "status_bar/images");
    }

    const outputBox = new Gtk.Box({
        valign: Gtk.Align.CENTER,
    })
    const icon = Gtk.Image.new_from_icon_name("burger-symbolic")
    icon.set_pixel_size(15.5);
    outputBox.set_css_classes(["button_system"])
    outputBox.append(icon)

    const clickGesture = new Gtk.GestureClick();
    clickGesture.connect("released", () => {
        GLib.spawn_command_line_sync(`python /usr/bin/modal_python/modal.py`)
    })

    outputBox.add_controller(clickGesture);
    
    return outputBox
}