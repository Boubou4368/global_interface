import Gtk from "gi://Gtk?version=4.0";
import Hyprland from "gi://AstalHyprland";

// On définit l'interface pour accepter la prop depuis my_Bar
interface BubbleProps {
    monitor_num: number;
}

export default function Bubble_name({ monitor_num }: BubbleProps) {
    const hypr = Hyprland.get_default();

    const labelBox = new Gtk.Label({
        hexpand: true,
        vexpand: true,
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
    });

    const outerBox = new Gtk.Box({
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER
    });

    outerBox.set_css_classes(["label-area"])

    outerBox.append(labelBox);

outerBox.append(labelBox);

    // Stockage des identifiants de signaux attachés aux fenêtres de ce moniteur
    let clientSignalIds: Array<{ client: any; id: number }> = [];

    const clearClientSignals = () => {
        clientSignalIds.forEach(({ client, id }) => {
            if (client && client.disconnect) {
                client.disconnect(id);
            }
        });
        clientSignalIds = [];
    };

    const update = () => {
        // 1. Récupérer l'objet Moniteur spécifique à cette barre
        const monitor = hypr.get_monitor(monitor_num);
        if (!monitor) return;

        // 2. Récupérer le workspace actuellement affiché sur ce moniteur
        const monitorWorkspace = monitor.get_active_workspace();
        if (!monitorWorkspace) return;

        // Récupérer toutes les fenêtres de ce moniteur
        const clientsOnThisMonitor = hypr.get_clients().filter(c => 
            c.get_workspace().get_id() === monitorWorkspace.get_id()
        );

        // Réabonnement propre aux signaux notify::title pour chaque fenêtre de l'écran
        clearClientSignals();
        clientsOnThisMonitor.forEach(c => {
            const sigId = c.connect("notify::title", () => {
                update();
            });
            clientSignalIds.push({ client: c, id: sigId });
        });

        // 3. Récupérer la fenêtre ayant le focus global
        const activeClient = hypr.get_focused_client();

        // CAS A : La fenêtre active globale est sur l'écran actuel
        if (activeClient && activeClient.get_workspace().get_id() === monitorWorkspace.get_id()) {
            labelBox.set_label(activeClient.get_title());
            labelBox.set_visible(true);
            outerBox.set_visible(true);
        } 
        // CAS B : Le focus est sur l'autre écran, MAIS on a des fenêtres ouvertes ici
        else if (clientsOnThisMonitor.length > 0) {
            labelBox.set_label(clientsOnThisMonitor[0].get_title());
            labelBox.set_visible(true);
            outerBox.set_visible(true);
        } 
        // CAS C : Le bureau de cet écran est vide
        else {
            labelBox.set_label("");
            labelBox.set_visible(false);
            outerBox.set_visible(false);
        }
    };

    // Écoute des changements de focus et de bureau
    hypr.connect("notify::focused-client", update);
    hypr.connect("notify::focused-workspace", update);
    
    // NOUVEAU : Écoute de l'ouverture, fermeture ou déplacement de fenêtres entre les écrans
    hypr.connect("client-added", update);
    hypr.connect("client-removed", update);
    hypr.connect("client-moved", update);

    update();

    return outerBox;
}