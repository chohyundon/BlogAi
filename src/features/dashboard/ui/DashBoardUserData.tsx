"use client";

import { useQueryUserData } from "@/entities/user/api/queryUserData";
import { useAuthStore } from "@/features/auth/model/AuthStore";
import type { DatabaseDocument } from "@/shared/types/database";
import { recentTemplates } from "@/features/dashboard/model/RecentTemplate";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashBoardUserData() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useQueryUserData(user?.id);
  const templates: DatabaseDocument[] = data ?? [];
  const recentTemplatesData = recentTemplates(templates);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-xl font-bold flex items-center gap-2">
          ⚙️ 최근 작성한 문서
        </h3>
        <Link
          className="text-amber-400 text-sm font-semibold hover:underline"
          href="/mypage">
          작성한 문서 전체 보기
        </Link>
      </div>
      {isLoading ? (
        <p className="text-slate-400 text-sm">로딩 중...</p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-4">
            {recentTemplatesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 bg-navy-900/50 border border-navy-700 border-dashed rounded-xl text-center">
                <p className="text-slate-400 text-sm mb-1">
                  아직 작성한 문서가 없어요
                </p>
                <p className="text-slate-500 text-xs">
                  위에서 템플릿을 선택하고 새 글을 작성해 보세요.
                </p>
              </div>
            ) : (
              recentTemplatesData.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-6 bg-navy-900 border border-navy-700 rounded-xl hover:bg-navy-800 transition-all cursor-pointer">
                  <h4 className="text-white font-bold text-sm">
                    {template.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-navy-700 text-[10px] font-mono text-slate-400 uppercase">
                      {template.template_type}
                    </span>
                    <ArrowRight className="size-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
