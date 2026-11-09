import { TabBar } from '@/components/TabBar';

/** White content sheet with rounded bottom corners, sitting on the black tab bar. */
export default function TabsLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="screen bg-black">
      <div className="pt-safe relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-[34px] bg-white">{children}</div>
      <TabBar />
    </div>
  );
}
