import { Astal, Gtk} from "ags/gtk4"
import { createPoll } from "ags/time"

import Circle from "./circle"
import Bubble_name from "./bubble_name"
import Button_system from "./button_system"
import Music_info from "./music_info"

export default function my_Bar(monitor_number: number, workspaces : Array<number>){
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
    const time = createPoll("", 1000, "date +%H:%M")

    // 1. On stocke la section gauche dans une variable
    const LeftSection = (
        <box
            visible
            class="workspaces-area"
            halign={Gtk.Align.START}
            valign={Gtk.Align.CENTER}
        >   
            <box class="box-circle">
                {workspaces.map((num) => (
                    <Circle workspaces_num={num} />
                ))}
            </box>
        </box>
    );

    // 2. On stocke la section centrale
    const CenterSection = (
        <box
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
        >
            <box>
                <Bubble_name monitor_num={monitor_number} />
            </box>
        </box>
    );

    // 3. On stocke la section droite
    const RightSection = (
        <box
            visible
            class="info"
            halign={Gtk.Align.END}
            valign={Gtk.Align.CENTER}
        >
            <box class="active_app_name">
                <Music_info/>
                <label class="clock" label={time}/>
                <Button_system/>
            </box>
        </box>
    );

    return (
        <window
            visible
            monitor={monitor_number}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | LEFT | RIGHT}
            class="top_bar"
            namespace="top_bar"
        >      
            {/* On assigne explicitement chaque section à son emplacement dédié */}
            <centerbox 
                startWidget={LeftSection}
                centerWidget={CenterSection}
                endWidget={RightSection}
            />
        </window>
    )
}