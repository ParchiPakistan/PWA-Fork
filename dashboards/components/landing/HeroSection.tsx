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
                        <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                            <Link
                                href="#"
                                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            >
                                {/* SVG for App Store */}
                                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.23-3.14-2.47-1.72-2.5-3-7.09-1.23-10.16 0.88-1.55 2.45-2.54 4.15-2.58 1.3-.03 2.52.87 3.32.87.79 0 2.29-1.09 3.86-0.93 0.65.03 2.48.26 3.65 1.98-0.09.06-2.18 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.53 3.05zm-4.78-15.01c0.7-.85 1.17-2.03 1.05-3.21-1.02.04-2.25.68-2.98 1.52-.66.75-1.23 1.96-1.08 3.12 1.14.09 2.31-.58 3.01-1.43z" />
                                </svg>
                                App Store
                            </Link>
                            <Link
                                href="#"
                                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            >
                                {/* SVG for Google Play */}
                                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                </svg>
                                Google Play
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-8">
                            <div className="flex flex-col space-y-1">
                                <span className="text-xl font-bold text-primary font-sans">Hundreds of</span>
                                <span className="text-sm text-muted-foreground font-medium">Merchants</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="text-xl font-bold text-secondary font-sans" style={{ color: '#E8C500' }}>Thousands of</span>
                                <span className="text-sm text-muted-foreground font-medium">Students</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="text-xl font-bold text-primary font-sans">Millions</span>
                                <span className="text-sm text-muted-foreground font-medium">Saved</span>
                            </div>
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
