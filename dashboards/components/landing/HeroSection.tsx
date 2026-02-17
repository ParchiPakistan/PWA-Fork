import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
    return (
        <section className="relative w-full py-6 md:py-12 lg:py-16 xl:py-24 bg-background overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-heading text-primary">
                                Your Student ID,
                                <br />
                                Now Your Superpower.
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl font-sans">
                                Stop carrying physical IDs. Get verified, unlock exclusive discounts at top brands, and save money every
                                single day with Parchi.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 min-[400px]:flex-row pt-4 items-center">
                            <Link
                                href="#"
                                className="transition-transform hover:scale-105"
                            >
                                <Image
                                    src="/app-store-badge.svg"
                                    alt="Download on the App Store"
                                    width={140}
                                    height={42}
                                    className="h-12 w-auto"
                                />
                            </Link>
                            <Link
                                href="#"
                                className="transition-transform hover:scale-105"
                            >
                                <Image
                                    src="/google-play-badge.svg"
                                    alt="Get it on Google Play"
                                    width={140}
                                    height={42}
                                    className="h-12 w-auto"
                                />
                            </Link>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-[400px] lg:max-w-none items-center justify-center">
                        {/* Simple colorful placeholder until real asset is ready */}
                        <div className="relative w-[300px] h-[600px] rounded-[40px] bg-gradient-to-br from-primary to-secondary shadow-2xl border-8 border-primary overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-x-0 top-0 h-8 bg-primary w-3/4 mx-auto rounded-b-2xl z-20"></div>
                            <div className="text-white text-center p-6">
                                <h3 className="font-heading text-2xl mb-2">Parchi</h3>
                                <p className="text-sm opacity-90">Student Discounts</p>
                                <div className="mt-8 bg-white/20 backdrop-blur-md rounded-xl p-4">
                                    <div className="h-20 w-20 bg-white rounded-full mx-auto mb-2"></div>
                                    <div className="h-4 w-3/4 bg-white/50 rounded mx-auto mb-2"></div>
                                    <div className="h-4 w-1/2 bg-white/50 rounded mx-auto"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Blobs */}
            <div className="absolute top-[-20%] right-[-10%] -z-10 opacity-10">
                <div className="w-[800px] h-[800px] bg-primary rounded-full blur-[120px]"></div>
            </div>
            <div className="absolute bottom-[-20%] left-[-10%] -z-10 opacity-10">
                <div className="w-[600px] h-[600px] bg-secondary rounded-full blur-[100px]"></div>
            </div>
        </section>
    )
}
