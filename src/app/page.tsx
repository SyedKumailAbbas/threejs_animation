// src/app/page.tsx
import ThreeCanvas from "@/components/ThreeCanvas";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main>
        <ThreeCanvas />
      </main>
    </div>
  );
}
