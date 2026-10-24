import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import my_Bar from "./status_bar/widget/my_bar";
import main_window from "./player_popup/widget/main_window";
import volume_bar from "./volume_player/componentes/volume_bar";

app.start({
    instanceName: "global_interface",
    css: "./style/style.css", // Un seul fichier CSS central
    requestHandler(request, res) {
        res("ok");
    },
    main() {
        // Astal gère les 3 fenêtres simultanément dans le même processus Wayland
        app.add_window(my_Bar(1,[1,2,3,4,5,6,7,8,9]) as Astal.Window);
        app.add_window(my_Bar(0,[10,11,12,13,14,15,16,17,18])as Astal.Window);
        app.add_window(main_window(0) as Astal.Window);
        app.add_window(main_window(1) as Astal.Window);
        app.add_window(volume_bar() as Astal.Window);
    }
});