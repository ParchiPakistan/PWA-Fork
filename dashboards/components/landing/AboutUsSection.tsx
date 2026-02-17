export function AboutUsSection() {
    return (
        <section className="w-full py-6 md:py-12 lg:py-16 bg-secondary">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">

                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-heading text-primary">
                                The Student Identity, Reimagined.
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground md:text-lg">
                            <p>
                                Parchi is Pakistan’s first closed-loop ecosystem built exclusively for the student community. We don't just offer deals; we provide the digital infrastructure that connects the country’s most ambitious demographic directly to the nation’s leading brands.
                            </p>
                            <p>
                                In a rapidly evolving economy, students are the primary drivers of growth, yet the gap between corporate giants and the campus lifestyle has always been wide. Parchi acts as the essential bridge. We simplify the exchange, ensuring that brands can reach students with precision, and students can access high-value utilities that were previously out of reach.
                            </p>
                        </div>

                        <div className="space-y-4 pt-6">
                            <h3 className="text-xl font-bold text-primary font-heading">Why We Exist</h3>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-secondary shrink-0" />
                                    <div>
                                        <span className="font-bold text-gray-900">Verified Exclusivity:</span>
                                        <p className="text-muted-foreground text-sm">Our verification system ensures that Parchi remains a sanctuary for students only.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-secondary shrink-0" />
                                    <div>
                                        <span className="font-bold text-gray-900">National Reach:</span>
                                        <p className="text-muted-foreground text-sm">From Karachi to Kashmir, we are building a unified network that recognizes and rewards your status as a student.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-secondary shrink-0" />
                                    <div>
                                        <span className="font-bold text-gray-900">A Purpose-Driven Ecosystem:</span>
                                        <p className="text-muted-foreground text-sm">We believe your student ID should be the most powerful card in your wallet.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-8 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                        <blockquote className="text-xl font-medium italic text-primary leading-relaxed">
                            "This is more than an app. This is the new standard for the Pakistani student."
                        </blockquote>
                    </div>

                </div>
            </div>
        </section>
    )
}
