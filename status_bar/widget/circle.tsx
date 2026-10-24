import Gtk from "gi://Gtk?version=4.0";
import Hyprland from "gi://AstalHyprland";
import GLib from "gi://GLib";
import Gdk from "gi://Gdk?version=4.0";

const display = Gdk.Display.get_default();
if (display) {
    const iconTheme = Gtk.IconTheme.get_for_display(display);
    iconTheme.add_search_path("status_bar/images");
}

function get_icon_name(app_class: string,window_name : string): string {
    switch (app_class.toLowerCase()) {
        case "code":
        case "com.microsoft.vscode":
            return "vs_code-symbolic";
        case "kitty":
            return "kitty2-symbolic";
        case "google-chrome":
            if (window_name.toLowerCase().includes("youtube -")){
                return "youtube2-symbolic"
            }
            if (window_name.toLowerCase().includes("github -")){
                return "github-symbolic"
            }
            return "chrome-symbolic";
        case "spotify":
            return "spotify-symbolic";
        case "org.kde.dolphin":
            return "file_manager-symbolic";
        case "md.obsidian.obsidian":
            return "obsidian_custome-symbolic";
        default:
            return "circle-symbolic"; 
    }
}

interface CircleProps {
    workspaces_num: number;
}

export default function Circle({ workspaces_num }: CircleProps) {
    const hypr = Hyprland.get_default();

    // 1. Instanciation manuelle des conteneurs GTK (remplace les balises <box>)
    const innerBox = new Gtk.Box({
        hexpand: true,
        vexpand: true,
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
        spacing: 4,
    });

    const outerBox = new Gtk.Box({
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER,
    });
    
    outerBox.append(innerBox);

    const clickGesture = new Gtk.GestureClick();

    clickGesture.connect("released", () => {
        // Option 1 : Via l'API native d'Astal (recommandé, zéro latence)
        hypr.dispatch("workspace", `${workspaces_num}`);

        // Option 2 : Équivalent strict en CLI si besoin
        // GLib.spawn_command_line_async(`hyprctl dispatch workspace ${workspaces_num}`);
    });

    // Attache le contrôleur de clic à la boîte
    outerBox.add_controller(clickGesture);

    // Tableau pour stocker les IDs de signaux connectés aux fenêtres
    let clientSignalIds: Array<{ client: any; id: number }> = [];

    const clearClientSignals = () => {
        clientSignalIds.forEach(({ client, id }) => {
            if (client && client.disconnect) {
                client.disconnect(id);
            }
        });
        clientSignalIds = [];
    };

    // 2. Fonction de mise à jour
    const update = () => {
        const clients = hypr.get_clients();
        const currentClients = clients.filter(
            c => (c.workspace?.id ?? c.get_workspace?.()?.get_id?.()) === workspaces_num
        );

        // Nettoyage et réabonnement aux signaux des clients de ce workspace
        clearClientSignals();
        currentClients.forEach(c => {
            const sigId = c.connect("notify::title", () => {
                update();
            });
            clientSignalIds.push({ client: c, id: sigId });
        });

        const workspaceApps = currentClients.map(c => ({
            appclass: c.get_class(),
            title: c.get_title(),
        }));

        // Bascule dynamique de la classe CSS
        outerBox.set_css_classes([
            workspaceApps.length > 1 ? "workspace-item-multi" : "workspace-item-single"
        ]);

        const active = hypr.get_focused_workspace();
        if (active && active.get_id() === workspaces_num) {
            outerBox.add_css_class("active");
        } else {
            outerBox.remove_css_class("active");
        }

        // Nettoyage propre de l'ancienne liste d'icônes
        let child = innerBox.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            innerBox.remove(child);
            child = next;
        }

        // Reconstruction de la liste d'icônes
        workspaceApps.forEach((app, index) => {
            const iconWidget = Gtk.Image.new_from_icon_name(get_icon_name(app.appclass, app.title));
            iconWidget.set_pixel_size(15.5);
            innerBox.append(iconWidget);

            if (index < workspaceApps.length - 1) {
                const sep = new Gtk.Label({ label: " | " });
                sep.add_css_class("separator");
                innerBox.append(sep);
            }
        });
    };
    // //ajout de l'interaction au clique 
    // outerBox.set_limit_events((workspaces_num) => {
    //     console.log(workspaces_num);
    // })
    // outerBox.add_events( )

    // 3. Écoute native des signaux Hyprland (déclenche update() au moindre changement)
    hypr.connect("client-added", update);
    hypr.connect("client-removed", update);
    hypr.connect("client-moved", update);

    hypr.connect("notify::focused-workspace", update);

    // Exécution initiale pour le rendu au lancement
    update();

    // Dans Astal, retourner un objet Gtk natif est parfaitement valide
    return outerBox;
}