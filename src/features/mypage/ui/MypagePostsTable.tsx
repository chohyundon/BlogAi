"use client";

import type { DatabaseDocument } from "@/shared/types/database";
import { Pencil, Trash2 } from "lucide-react";
import TemplateTypeBadge from "@/features/mypage/ui/TemplateTypeBadge";

type MypagePostsTableProps = {
  items: DatabaseDocument[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function MypagePostsTable({
  items,
  onEdit,
  onDelete,
}: MypagePostsTableProps) {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-navy-800/50 border-b border-navy-700">
          <th className="w-1/2 px-6 py-4 text-xs font-bold text-slate-500">
            포스트 정보
          </th>
          <th className="w-1/4 px-6 py-4 text-xs font-bold text-slate-500">
            템플릿
          </th>
          <th className="w-1/4 px-6 py-4 text-xs font-bold text-slate-500 text-center">
            생성날짜
          </th>
          <th className="px-6 py-4 text-xs font-bold text-slate-500 text-center whitespace-nowrap">
            관리
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-navy-700">
        {items.map((template) => (
          <tr key={template.id}>
            <td className="px-6 py-4 text-white">
              <p className="text-sm font-medium">{template.title}</p>
              <p className="text-xs text-slate-400">
                {template.content?.slice(0, 50) ?? ""}
                {(template.content?.length ?? 0) > 50 ? "..." : ""}
              </p>
            </td>
            <td className="px-6 py-4">
              <TemplateTypeBadge templateType={template.template_type} />
            </td>
            <td>
              <p className="text-xs text-slate-400 text-center">
                {template.created_at
                  ? new Date(template.created_at).toLocaleDateString()
                  : "-"}
              </p>
            </td>
            <td className="px-6 py-4 text-center whitespace-nowrap">
              <button
                type="button"
                onClick={() => onEdit(template.id)}
                className="p-2 hover:bg-navy-700 rounded-lg text-slate-400 hover:text-slate-300 transition-colors cursor-pointer">
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-navy-700 rounded-lg text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
                onClick={() => onDelete(template.id)}>
                <Trash2 className="size-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
