import { getAllNavigationMenus } from "@/actions/navigationMenu";
import { getAllPages } from "@/actions/customPage";
import MenuBuilderClient from "./MenuBuilderClient";
import { LayoutDashboard } from "lucide-react"; // Wait, earlier I used LayoutDashboard but I should use something like Menu or Map, let me just keep LayoutDashboard as per sidebar

export default async function NavigationMenuPage() {
  const menus = await getAllNavigationMenus();
  const customPages = await getAllPages();

  return (
    <div className="space-y-6 animate-slide-up max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center ring-4 ring-orange-50 dark:ring-orange-500/10 shrink-0">
             <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Menu Navigation Builder</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Atur struktur menu dan sub-menu publik dengan visibilitas berbasis role.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 transition-colors p-6">
        <MenuBuilderClient initialMenus={menus} customPages={customPages} />
      </div>
    </div>
  );
}
