import React from "react";
import { getOrganizationStructure } from "@/actions/organization";

export default async function OrganigramSection() {
  const members = await getOrganizationStructure();
  
  if (!members || members.length === 0) return null;

  // Build tree
  const memberMap = new Map();
  members.forEach((m: any) => memberMap.set(m._id.toString(), { ...m, children: [] }));
  
  let rootLevel: any[] = [];
  
  members.forEach((m: any) => {
    const parentId = m.parent_id?.toString();
    if (parentId && memberMap.has(parentId)) {
      memberMap.get(parentId).children.push(memberMap.get(m._id.toString()));
    } else {
      rootLevel.push(memberMap.get(m._id.toString()));
    }
  });

  const renderNode = (node: any) => {
    return (
      <div key={node._id} className="flex flex-col items-center">
         <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm flex flex-col items-center w-52 relative z-10 transition-transform hover:-translate-y-1 text-center">
           <img 
             src={node.photo || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=250&auto=format&fit=crop"} 
             alt={node.name} 
             className="w-20 h-20 rounded-full object-cover shadow-inner mb-3 border-[3px] border-[var(--primary-color)]" 
           />
           <p className="font-bold text-slate-800 dark:text-white text-sm line-clamp-2 leading-tight mb-2 min-h-8 flex items-center">{node.name}</p>
           <p className="text-[10px] text-[var(--primary-color)] uppercase tracking-wider font-bold bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full line-clamp-1">
             {node.position}
           </p>
         </div>
         
         {node.children && node.children.length > 0 && (
           <div className="flex flex-col items-center">
             {/* Vertical line from parent to horizontal divider */}
             <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
             
             {/* Children horizontal flex container */}
             <div className="flex justify-center relative">
                {node.children.map((child: any, index: number) => {
                   let lineClasses = "";
                   if (node.children.length > 1) {
                     if (index === 0) lineClasses = "left-1/2 w-1/2 right-0";
                     else if (index === node.children.length - 1) lineClasses = "right-1/2 w-1/2 left-0";
                     else lineClasses = "left-0 w-full";
                   }
                   
                   return (
                     <div key={child._id} className="flex flex-col items-center relative px-2 sm:px-4 pt-6">
                        {/* Horizontal connecting line */}
                        {node.children.length > 1 && (
                            <div className={`absolute top-0 h-px bg-slate-300 dark:bg-slate-600 ${lineClasses}`}></div>
                        )}
                        {/* Vertical stem to child */}
                        <div className="absolute top-0 w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
                        {renderNode(child)}
                     </div>
                   );
                })}
             </div>
           </div>
         )}
      </div>
    );
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
      <div className="container mx-auto px-4 min-w-[max-content] pb-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4 uppercase">Struktur Organisasi</h2>
          <div className="w-24 h-1 bg-[var(--primary-color)] mx-auto rounded-full"></div>
        </div>
        
        <div className="flex justify-center flex-wrap gap-8 items-start">
           {rootLevel.map((root) => renderNode(root))}
        </div>
      </div>
    </section>
  );
}
