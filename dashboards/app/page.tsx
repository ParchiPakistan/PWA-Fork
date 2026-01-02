import Image from "next/image"

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#e3e935] p-4">
      <div className="relative w-[300px] h-[100px] md:w-[500px] md:h-[160px] mb-12">
        <Image
          src="/ParchiFullTextNewBlue.svg"
          alt="Parchi"
          fill
          className="object-contain"
          priority
        />
      </div>
      
      <div className="text-center space-y-4">
        <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-primary tracking-tight font-heading">
          COMING SOON!
        </h1>
        <p className="text-primary text-lg md:text-xl font-medium max-w-md mx-auto">
          We are working hard to bring you the best experience. Stay tuned!
        </p>
      </div>
    </main>
  )
}
