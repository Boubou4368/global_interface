import app from "ags/gtk4/app";
import Astal from "gi://Astal?version=4.0";
import Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib";
import Wp from "gi://AstalWp";
import Hyprland from "gi://AstalHyprland";

export default function volume_bar(){

    const hyprland = Hyprland.get_default();


    // Récupération de l'instance WirePlumber et du haut-parleur par défaut
    const wp = Wp.get_default();
    const speaker = wp?.audio.defaultSpeaker;

    // Variable pour stocker l'ID du minuteur en cours
    let timeoutId: number | null = null;

    // box qui contient la barre de son grise a 100% avec a gauche le volume 
    // et a droite l'icone du periphérique
    const mainbox = new Gtk.Box({
        css_classes : ["global_box"],
        halign : Gtk.Align.CENTER,
        valign : Gtk.Align.CENTER,
        spacing : 4,
    })

    // Valeur son
    const volume_value = new Gtk.Label({
        css_classes : ["volume_value"],
    })
    
    // Volume
    const volume_empty = new Gtk.Box({
        css_classes : ["volume_empty"],
        halign : Gtk.Align.CENTER,
        valign : Gtk.Align.CENTER,
        hexpand : false,
        vexpand : false,
    })

    const volume_fill = new Gtk.Box({
        css_classes : ["volume_fill"],
        halign : Gtk.Align.START,
        valign : Gtk.Align.CENTER,
    })

    volume_empty.append(volume_fill)

    // Icone
    const speaker_icon = new Gtk.Image({
        css_classes : ["speaker_icon"]
    })
    speaker_icon.set_from_file("volume_player/images/headset.svg")

    // Appends
    mainbox.append(speaker_icon)
    mainbox.append(volume_empty)
    mainbox.append(volume_value)

    // window
    const win = new Astal.Window({
        name : `volume`,
        application : app,
        css_classes : ["main_volume"],
        monitor: 1,
        anchor: Astal.WindowAnchor.BOTTOM,
        marginBottom: 30,
        namespace: "volume_popup",
        visible: false,
    })
    hyprland.connect("notify::focused-monitor", () => {
        win.monitor = hyprland.focusedMonitor?.id;
    });
    const mainContainer = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER,
    });

    mainContainer.append(mainbox);
    win.set_child(mainContainer);

    //logique
        const cssProvider = new Gtk.CssProvider();
    volume_fill.get_style_context().add_provider(
        cssProvider,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    )
    const show_and_update_popup = () => {
        win.visible = true;
        if (timeoutId !== null) {
            GLib.source_remove(timeoutId);
        }
        timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
            win.visible = false;
            timeoutId = null; // On réinitialise l'ID
            
            // Retourner GLib.SOURCE_REMOVE est obligatoire pour que la boucle s'arrête
            return GLib.SOURCE_REMOVE; 
        });
        if (speaker) {
            const currentVolume = speaker.volume;
            const val  = Math.round(currentVolume * 100);
            volume_value.set_label(val.toString());
            const w = Math.round(160 * currentVolume)
            const cssData = `
            .volume_fill {
                min-width : ${w}px;
            }
            `
            cssProvider.load_from_data(cssData,-1)
        }

    }

    show_and_update_popup();
    if (speaker) {
        speaker.connect("notify::volume", () => {
            show_and_update_popup();
        });
    }

    return win
}