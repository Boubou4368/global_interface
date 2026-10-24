import Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk?version=4.0";

import { mediaService } from "./../../media_data"

export default function Music_info() {
    const musicLabel = new Gtk.Label({label: "" });
    const neonBox = new Gtk.Box({
        css_classes: ["none"]
    });
    const volumeBox = new Gtk.Box({
        css_classes : ["volume"]
    })
    const image_player_status = new Gtk.Image() 
    image_player_status.set_pixel_size(12);
    const display = Gdk.Display.get_default();
    if (display) {
        const iconTheme = Gtk.IconTheme.get_for_display(display);
        iconTheme.add_search_path(GLib.get_current_dir() + "status_bar/images");
    }

    const clickGesture = new Gtk.GestureClick();
    clickGesture.connect("released", () => {
        GLib.spawn_command_line_sync(`playerctl play-pause toggle`)
    })

    image_player_status.add_controller(clickGesture);

    const clickGesture_musicLabel = new Gtk.GestureClick();
    clickGesture_musicLabel.connect("released", () => {
        GLib.spawn_command_line_async(`/home/boubou/.config/hypr/Scripts/player_popup.sh`)
    })

    musicLabel.add_controller(clickGesture_musicLabel);

    const proc = new Gio.Subprocess({
        argv: ['/home/boubou/.config/hypr/Scripts/media.sh'],
        flags: Gio.SubprocessFlags.STDOUT_PIPE,
    });
    proc.init(null);

    const stream = new Gio.DataInputStream({
        base_stream: proc.get_stdout_pipe(),
    });

    const readLine = () => {
        stream.read_line_async(GLib.PRIORITY_DEFAULT, null, (source, res) => {
            try {
                // console.log(source.read_line_finish_utf8(res))
                const [line] = source.read_line_finish_utf8(res);
                // console.log(line);
                if (line !== null) {
                    const jsonObject = JSON.parse(line);
                    let text = jsonObject.text;
                    let status = jsonObject.status;
                    const classe_player = jsonObject.class;
                    neonBox.set_css_classes([classe_player]);

                    musicLabel.set_label(text || "");
                    if (status === "Playing"){
                        // console.log("ca joue ");
                        image_player_status.set_from_icon_name("playing-symbolic")
                    }else if (status === "Paused"){
                        // console.log("sur pause");
                        image_player_status.set_from_icon_name("paused-symbolic")
                    }else if (status === "Stopped") {
                        // console.log("fermé");
                        image_player_status.set_from_icon_name(null);

                    }else {
                        console.log("Erreur, aucun status trouvé",status)
                    }
                }
                readLine();
            } catch (e) {
                console.error("Erreur de flux :", e);
            }
        });
    };
    readLine();

    const contentBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 5 });
    // const volume_labelBox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, valign: Gtk.Align.CENTER});
    contentBox.set_css_classes(["music_player"]);
    contentBox.append(image_player_status);
    contentBox.append(musicLabel);
    // contentBox.append(volumeBox);
    // volume_labelBox.append(musicLabel);
    // volume_labelBox.append(volumeBox);
    // contentBox.append(volume_labelBox);
    neonBox.append(contentBox);

    return neonBox;

    // return (
    // <box class={classe_player}>
    //     <box orientation={Gtk.Orientation.HORIZONTAL} spacing={5}>
    //         <box halign={Gtk.Align.CENTER} class="music">{image_player_status} {musicLabel}</box>           
    //     </box>
    // </box>
    // );
}