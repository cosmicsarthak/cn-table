"use client"

import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
    user: {
        name: "HissanAero",
        email: "sales@hissan-aero.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "Sarthak (Dev)",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
        {
            name: "Hissan Aero 2",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Hissan",
            logo: Command,
            plan: "Free",
        },
    ],
    navMain: [
        {
            title: "Orders",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: "Default View",
                    url: "#",
                },
                {
                    title: "Sales View",
                    url: "/sales",
                },
                {
                    title: "Logistics View",
                    url: "/logistics",
                },
            ],
        },
        {
            title: "Models",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "Genesis",
                    url: "#",
                },
                {
                    title: "Explorer",
                    url: "#",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
    data: [
        {
            name: "Overview",
            url: "/overview",
            icon: PieChart,
        },
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        // {
        //     name: "Travel",
        //     url: "#",
        //     icon: Map,
        // },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavProjects data={data.data} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
