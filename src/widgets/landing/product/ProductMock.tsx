import SuggestCard from "../card/SuggestCard";
import DemoWindowChrome from "../demo/DemoWindow";
import { DemoEditorPane, DemoPreviewPane } from "../demo/DemoWindow";

export default function ProductMockup() {
  return (
    <div className="relative w-full max-w-5xl group">
      <div className="absolute -inset-1 bg-linear-to-r from-amber-500/50 to-purple-500/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-navy-600 bg-navy-900/80 backdrop-blur">
        <DemoWindowChrome />
        <div className="flex h-[400px]">
          <DemoEditorPane />
          <DemoPreviewPane />
        </div>
      </div>
      <SuggestCard />
    </div>
  );
}
