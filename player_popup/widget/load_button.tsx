import Gio from "gi://Gio";
import GLib from "gi://GLib?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import { exec } from "ags/process";
import { mediaService, MediaPayload } from "./../../media_data";


const PATH_PAUSE = "player_popup/images/pause_media.svg";
const PATH_PLAY = "player_popup/images/test.svg";
const PATH_NEXT = "player_popup/images/next.svg";
const PATH_PREVIOUS = "player_popup/images/previous.svg";
const size_icone = 23

export default function ButtonPlayer(){
    const imageWidget = Gtk.Image.new_from_file(PATH_PLAY);
    const imageNext = Gtk.Image.new_from_file(PATH_NEXT);
    const imagePrevious = Gtk.Image.new_from_file(PATH_PREVIOUS);
    imageWidget.set_pixel_size(size_icone);
    imageNext.set_pixel_size(size_icone);
    imagePrevious.set_pixel_size(size_icone);
    let statusLabel = new Gtk.Label({label : "Paused"});
    // let proc : Gio.Subprocess = launch_listener();
    // proc.init(null)

    // let stream : Gio.DataInputStream = launch_data(proc);
    
    // const sleep = (ms: number): Promise<void> => {
    //     return new Promise((resolve) => setTimeout(resolve, ms));
    // };
    // readLine(stream, statusLabel, imageWidget);

    mediaService.connect("changed", (_, data : MediaPayload) => {
        // console.log(data);

        const status = data.status;

        statusLabel.set_label(status || "Paused");

        if (statusLabel.get_label() === "Stopped"){
            imageWidget.set_from_file(PATH_PLAY)
        }

        if (statusLabel.get_label() === "Paused"){
            imageWidget.set_from_file(PATH_PLAY)
        }
        else if (statusLabel.get_label() === "Playing"){
            imageWidget.set_from_file(PATH_PAUSE)
        }

    })

    const togglePlay = async() => {
        try {
            GLib.spawn_command_line_sync("playerctl play-pause");
            // await sleep(100)
            // readLine(stream, statusLabel, imageWidget);
        }catch (e){
            console.error("Erreur player-pause",e );
        }
    };
    
    

    return (
        <box orientation={Gtk.Orientation.HORIZONTAL} halign={Gtk.Align.CENTER} spacing={20} hexpand={true}>
            <button class="buttonPlayer fs" onClicked={() => exec("playerctl previous")}>
                {imagePrevious}
            </button>
            <button 
                class="buttonPlayer"
                onClicked={togglePlay}
            >
                {imageWidget}
            </button>
            <button class="buttonPlayer fs" onClicked={() => exec("playerctl next")}>
                {imageNext}
            </button>
        </box>
    );
}