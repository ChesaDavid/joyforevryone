import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-gray-950 font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-white-800">Welcome to JoyForEveryone</h1>
        <div className="flex items-center gap-4">

        </div>
        
    
      </main>
      {/* chestile alea de arata bine */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"></div>
      </div>
    </div>
  );
}
