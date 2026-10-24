import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk?version=4.0";
import { mediaService, MediaPayload } from "./../../media_data";

export default function DynamicPlayer() {
    let currentCoverUrl = "";
    const titleLabel = new Gtk.Label({ label: "..." });
    const artistLabel = new Gtk.Label({ label: "" });
    const coverImage = new Gtk.Picture({
        can_shrink: true,
        content_fit: Gtk.ContentFit.COVER,
    });

    const dummyBox = new Gtk.Box({
        widthRequest: 150,
        heightRequest: 150,
        hexpand: false,
        vexpand: false,
    });

    const coverOverlay = new Gtk.Overlay({
        halign: Gtk.Align.CENTER,
        css_classes: ["cover-art"],
        overflow: Gtk.Overflow.HIDDEN,
    });
    coverOverlay.set_child(dummyBox);
    coverOverlay.add_overlay(coverImage);

    const cssProvider = new Gtk.CssProvider();
    coverOverlay.get_style_context().add_provider(
        cssProvider,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    );

    const updateCover = (width = 150) => {
        const cssData = `
            .cover-art {
                background-repeat: no-repeat;
                min-width: ${width}px;
                min-height: 150px;
                border-radius: 12px;
            }
        `;
        cssProvider.load_from_data(cssData, -1);
    };

    // Connexion propre au service typé
    mediaService.connect("changed", (_, data: MediaPayload) => {
        console.log("[DynamicPlayer] Données reçues :", data);

        const title = data.title;
        const artist = data.artist;
        const artUrl = data.cover_url;
        const status = data.status;

        titleLabel.set_label(title || "...");
        artistLabel.set_label(artist || "");

        if (status === "Stopped") {
            coverImage.file = null;
            currentCoverUrl = "";
            return;
        }

        if (artUrl && artUrl !== currentCoverUrl) {
            const rawUrl = artUrl.trim();
            currentCoverUrl = artUrl;
            coverImage.file = null;

            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                const file = Gio.File.new_for_path("/tmp/cover");
                coverImage.file = file;

                if (rawUrl.startsWith("http")) {
                    dummyBox.set_size_request(150, 150);
                    coverImage.can_shrink = true;
                    updateCover(150);
                } else {
                    dummyBox.set_size_request(220, 150);
                    updateCover(220);
                }
                return GLib.SOURCE_REMOVE;
            });
        }
    });

    return (
        <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
            {coverOverlay}
            <box halign={Gtk.Align.CENTER} class="title">{titleLabel}</box>
            <box halign={Gtk.Align.CENTER} class="artiste">{artistLabel}</box>
        </box>
    );
}