"use client";

import { TEMPLATES } from "@/entities/template/config/Template";
import { useRouter } from "next/navigation";
import { IdBadgeStyle } from "@/entities/template/config/BadgeStyle";
import Button from "@/shared/ui/Button";

export default function Template() {
  const router = useRouter();

  const handlePreview = (id: string) => {
    router.push(`/example/${id}`);
  };

  return (
    <main className="flex-1 p-8 w-full h-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-2">템플릿 예시</h2>
          <p className="text-slate-600">
            AI의 도움을 받아 구조화된 기술 블로그 포스트를 시작하세요.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-navy-700/50 shadow-lg h-60 rounded-lg p-4 relative">
              <div className="flex justify-between items-center">
                <tpl.icon className="bg-amber-200/10 rounded-md p-2 size-8 text-amber-300" />
                <span
                  className={
                    IdBadgeStyle[tpl.id] ??
                    "text-slate-400 text-xs font-medium bg-navy-600/50 rounded-lg px-3 py-1.5"
                  }>
                  {tpl.id}
                </span>
              </div>
              <div className="flex flex-col mt-4">
                <h2 className="text-white text-2xl font-bold mb-2">
                  {tpl.name}
                </h2>
                <p className="text-slate-400 text-sm">{tpl.description}</p>
              </div>
              <div className="w-full mx-auto mt-10">
                <Button
                  onClick={() => handlePreview(tpl.id)}
                  className="w-full py-2.5 bg-navy-600 text-white font-bold rounded-lg hover:bg-navy-500 transition-all">
                  Preview
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
