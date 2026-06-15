import { TEMPLATE_ID } from "@/entities/template/model/template";
import DashBoardHeader from "@/features/dashboard/ui/DashBoardHeader";
import DashBoardUserData from "@/features/dashboard/ui/DashBoardUserData";
import Image from "next/image";
import { TEMPLATE_IMAGES } from "@/entities/template/config/Template";

export default function DashBoard() {
  return (
    <main className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-navy-950">
      <div className="mx-auto px-8 py-10">
        <DashBoardHeader />
        <section className="mb-12">
          <h3 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
            🚀 새 글 쓰기
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {TEMPLATE_ID.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-navy-700/50 shadow-lg rounded-xl overflow-hidden border border-navy-600 hover:border-navy-500 transition-all">
                <div className="relative h-48 w-full bg-navy-800">
                  <Image
                    src={TEMPLATE_IMAGES[tpl.id] ?? TEMPLATE_IMAGES.TIL}
                    alt={tpl.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {tpl.name}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {tpl.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <DashBoardUserData />
      </div>
    </main>
  );
}
