export default function Footer() {
  return (
    <footer className="h-16 bg-leaf-950 dark:bg-[#0a0f0c] text-white px-4 md:px-10 flex items-center justify-between shrink-0 sticky bottom-0 z-50 border-t border-transparent dark:border-[#1a231d] transition-colors">
      <div className="flex items-center gap-4 hidden sm:flex">
        <span className="text-[10px] uppercase tracking-widest opacity-60">Đang đọc:</span>
        <span className="text-sm font-medium">Thanh Phong Minh Nguyệt (Chương 2)</span>
      </div>
      <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex gap-4">
          <span className="text-xs opacity-80 hidden md:block">Cỡ chữ: 100%</span>
          <span className="text-xs opacity-80 hidden md:block">Nền: Xanh mát</span>
        </div>
        <button className="bg-leaf-800 dark:bg-[#4A7C59] hover:bg-leaf-700 dark:hover:bg-[#5C705C] transition-colors px-6 py-2 rounded-lg text-xs font-bold shadow-sm">
          Tiếp tục đọc
        </button>
      </div>
    </footer>
  );
}
