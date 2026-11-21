import { type ComponentProps, type ComponentType } from "react";

import EmojiIcon from "@/components/ui/Icon/EmojiIcon";
import HomeIcon from "@/components/ui/Icon/HomeIcon";
import StarIcon from "@/components/ui/Icon/StarIcon";
import cn from "@/lib/helpers/cn";

type TabId = "home" | "my" | "friend";

interface TabIconProps {
  filled?: boolean;
}

const tabs: { id: TabId; label: string; Icon: ComponentType<TabIconProps> }[] =
  [
    { id: "home", label: "Home", Icon: HomeIcon },
    { id: "my", label: "My", Icon: StarIcon },
    { id: "friend", label: "Friend", Icon: EmojiIcon },
  ];

interface BottomTabBarProps extends Omit<ComponentProps<"nav">, "onSelect"> {
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
}

const BottomTabBar = ({
  activeTab,
  onSelect,
  className,
  ...props
}: BottomTabBarProps) => {
  return (
    <nav
      aria-label="하단 메뉴"
      className={cn(
        "inline-flex items-center rounded-md bg-gray-800 p-2.5",
        className,
      )}
      {...props}
    >
      {tabs.map(({ id, label, Icon }) => {
        const active = id === activeTab;

        return (
          <button
            key={id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onSelect(id)}
            className={cn(
              "flex h-13.75 w-27.5 flex-col items-center justify-center rounded-nav-item text-nav",
              active ? "bg-gray-50 text-gray-800" : "text-gray-50",
            )}
          >
            <Icon filled={active} />
            {label}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomTabBar;
