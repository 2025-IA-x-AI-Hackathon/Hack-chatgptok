import BottomNavigation from "@/components/home/bottom-navigation";

export default function WithNavigationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            {children}
            <BottomNavigation />
        </div>
    )
}