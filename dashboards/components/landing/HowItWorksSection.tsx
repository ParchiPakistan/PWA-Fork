import { UserCheck, Smartphone, QrCode } from "lucide-react"

export function HowItWorksSection() {
    const steps = [
        {
            icon: UserCheck,
            title: "Sign Up & Verify",
            description: "Download the app and verify your student status instantly using your Student ID card or .edu email.",
            color: "bg-primary/10 text-primary",
        },
        {
            icon: Smartphone,
            title: "Explore Offers",
            description: "Browse thousands of exclusive deals from your favorite brands, sorted by category and location.",
            color: "bg-secondary/20 text-yellow-600",
        },
        {
            icon: QrCode,
            title: "Instant Redemption",
            description: "Walk in, show your Parchi ID on the app, and get your discount applied instantly at the counter.",
            color: "bg-green-100 text-green-600",
        },
    ]

    return (
        <section className="w-full py-6 md:py-12 lg:py-16 bg-secondary">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-heading text-primary">How It Works</h2>
                        <p className="max-w-[900px] text-primary/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Getting started with Parchi is simple. No complicated points systems—just direct discounts.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center space-y-4 text-center group">
                            <div className={`flex h-20 w-20 items-center justify-center rounded-full ${step.color} transition-transform group-hover:scale-110`}>
                                <step.icon className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold font-heading text-primary">{step.title}</h3>
                                <p className="text-primary/70">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
