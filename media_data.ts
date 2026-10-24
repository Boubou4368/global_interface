import Gio from "gi://Gio";
import GLib from "gi://GLib";
import GObject from "gi://GObject";

export interface MediaPayload {
    text: string;
    class: string;
    cover_url: string;
    title: string;
    artist: string;
    status: string;
}

// Déclaration de l'interface pour satisfaire le compilateur TypeScript
export interface MediaService extends GObject.Object {
    data: MediaPayload | null;
    connect(signal: "changed", callback: (source: this, data: MediaPayload) => void): number;
}

export const MediaService = GObject.registerClass({
    GTypeName: "MediaService",
    Signals: {
        // En GJS, un signal transmettant un argument générique (object/string) se déclare ainsi :
        "changed": {
            param_types: [GObject.TYPE_JSOBJECT],
        },
    },
}, class MediaService extends GObject.Object {
    public data: MediaPayload | null = null;

    constructor() {
        super();
        this._startProcess();
    }

    private _startProcess() {
        try {
            const proc = new Gio.Subprocess({
                argv: ["/home/boubou/.config/hypr/Scripts/media.sh"],
                flags: Gio.SubprocessFlags.STDOUT_PIPE,
            });
            proc.init(null);

            const stdoutStream = new Gio.DataInputStream({
                base_stream: proc.get_stdout_pipe(),
            });

            const readLine = () => {
                stdoutStream.read_line_async(GLib.PRIORITY_DEFAULT, null, (stream, res) => {
                    try {
                        const [line] = stream!.read_line_finish_utf8(res);
                        if (line !== null) {
                            const trimmed = line.trim();
                            if (trimmed.length > 0) {
                                const parsed = JSON.parse(trimmed) as MediaPayload;
                                this.data = parsed;
                                // On émet l'objet parsé directement
                                this.emit("changed", parsed);
                            }
                            readLine();
                        }
                    } catch (err) {
                        console.error("[MediaService] Erreur lecture flux:", err);
                        readLine();
                    }
                });
            };

            readLine();
        } catch (e) {
            console.error("[MediaService] Erreur lancement process:", e);
        }
    }
});

// Singleton exporté
export const mediaService = new MediaService();