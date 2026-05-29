import { getPageBySlug } from "@/actions/customPage";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if(!page) return { title: "Halaman Tidak Ditemukan" };
  return {
    title: page.title,
    description: page.meta_description,
  };
}

// Block Renderer Component
function BlockRenderer({ block }: { block: any }) {
  let props = {};
  try {
    props = JSON.parse(block.props_json_string || "{}");
  } catch(e) {
    console.error("Invalid JSON for block", block.id);
  }

  const { type } = block; // Wait, schema uses component_type
  const componentType = block.component_type;

  switch (componentType) {
    case "text":
      return (
        <div className="container mx-auto px-4 py-8 max-w-4xl prose dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: (props as any).content || "" }} />
        </div>
      );
    
    case "hero":
      return (
        <div className="relative w-full overflow-hidden bg-slate-900 rounded-2xl my-8 min-h-[400px] flex items-center justify-center isolate px-6 py-24 sm:py-32 lg:px-8">
          {(props as any).imageUrl && (
            <img src={(props as any).imageUrl} alt={(props as any).title} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />
          )}
          <div className="mx-auto max-w-2xl text-center z-10">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">{(props as any).title}</h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">{(props as any).subtitle}</p>
          </div>
        </div>
      );
    
    case "grid":
      const items = (props as any).items || [];
      const cols = (props as any).columns || 3;
      return (
        <div className="container mx-auto px-4 py-8">
          <div className={`grid gap-6 grid-cols-1 md:grid-cols-${cols}`}>
            {items.map((item: any, idx: number) => (
              <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 hover:shadow-md transition-all group">
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
      
      case "faq":
      const faqItems = (props as any).items || [];
      return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">Pertanyaan yang Sering Diajukan</h2>
          <Accordion {...{ type: "single", collapsible: true } as any} className="w-full">
            {faqItems.map((item: any, idx: number) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left font-semibold text-slate-800 dark:text-slate-200">{item.question}</AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );

    case "image":
      const alignment = (props as any).alignment || "center";
      const alignClass = alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center";
      return (
        <div className="container mx-auto px-4 py-8">
          <figure className={`w-full max-w-4xl mx-auto ${alignClass}`}>
            <img src={(props as any).imageUrl} alt={(props as any).caption || "Gambar"} className="rounded-xl shadow-md inline-block max-w-full h-auto" />
            {(props as any).caption && <figcaption className="mt-3 text-sm text-slate-500 italic">{(props as any).caption}</figcaption>}
          </figure>
        </div>
      );

    case "video":
      let videoId = "";
      const url = (props as any).youtubeUrl || "";
      if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
      else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("embed/")) videoId = url.split("embed/")[1].split("?")[0];

      return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 aspect-video shadow-lg">
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={(props as any).title || "Video Khusus"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">Video tidak tersedia</div>
            )}
          </div>
        </div>
      );

    case "gallery":
      const galImages = (props as any).images || [];
      const galCols = (props as any).columns || 3;
      return (
        <div className="container mx-auto px-4 py-8">
          <div className={`grid gap-4 grid-cols-2 md:grid-cols-${galCols}`}>
            {galImages.map((img: any, idx: number) => (
               <figure key={idx} className="relative group overflow-hidden rounded-xl bg-slate-100 aspect-square">
                 <img src={img.url} alt={img.caption || `Galeri ${idx}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                 {img.caption && (
                   <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                     <p className="text-white text-sm font-medium">{img.caption}</p>
                   </div>
                 )}
               </figure>
            ))}
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-16 text-center shadow-xl text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{(props as any).title}</h2>
            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">{(props as any).description}</p>
            <Link href={(props as any).buttonUrl || "#"}>
              <Button size="lg" className="bg-white text-blue-700 hover:bg-slate-100 hover:scale-105 transition-all text-lg font-bold px-8 h-14 rounded-xl shadow-lg">
                {(props as any).buttonText || "Selanjutnya"}
              </Button>
            </Link>
          </div>
        </div>
      );

    case "divider":
      const style = (props as any).style || "solid";
      const spacing = (props as any).spacing || "medium";
      let py = "py-8";
      if(spacing === "small") py = "py-4";
      if(spacing === "large") py = "py-16";

      if(style === "transparent") {
        return <div className={`w-full ${py}`}></div>;
      }
      return (
        <div className={`container mx-auto px-4 ${py}`}>
          <hr className={`border-t-2 border-slate-200 dark:border-white/10 ${style === 'dashed' ? 'border-dashed' : 'border-solid'}`} />
        </div>
      );

    default:
      return (
        <div className="p-4 border border-dashed border-red-500 m-4 flex flex-col">
          <span className="text-red-500 font-bold mb-2">Unknown component_type: {componentType}</span>
          <pre className="text-xs text-slate-500 overflow-auto bg-slate-100 p-2 rounded">{JSON.stringify(props, null, 2)}</pre>
        </div>
      );
  }
}

export default async function CustomPageRender({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    redirect("/");
  }

  // Sort blocks by display order
  const blocks = [...(page.layout_blocks || [])].sort((a,b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 pb-20">
      {/* Header Spacer or Breadcrumb could go here */}
      <div className="w-full bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{page.title}</h1>
          {page.meta_description && (
             <p className="max-w-2xl mx-auto mt-4 text-lg text-slate-600 dark:text-slate-400">{page.meta_description}</p>
          )}
        </div>
      </div>

      {/* Blocks Rendering Engine */}
      <div className="flex-1 w-full mx-auto">
        {blocks.length === 0 ? (
          <div className="container mx-auto py-20 text-center text-slate-500">
            Halaman ini belum memiliki konten.
          </div>
        ) : (
          blocks.map(block => (
            <BlockRenderer key={block.id} block={block} />
          ))
        )}
      </div>
    </div>
  );
}
