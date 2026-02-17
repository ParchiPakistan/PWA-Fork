import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQSection() {
    const faqs = [
        {
            question: 'What is a "Closed-Loop" ecosystem?',
            answer: 'Parchi is a restricted environment. To maintain the quality and exclusivity of our offers, only verified students currently enrolled in a recognized Pakistani institution can access the platform.'
        },
        {
            question: "How do I verify my student status?",
            answer: "You can verify your account by uploading a clear photo of your valid Student ID or by using your university-issued email address (.edu.pk). Our team typically reviews and approves profiles within 24 hours."
        },
        {
            question: "My institute isn't listed. What should I do?",
            answer: 'We are rapidly expanding across Pakistan. If your institution isn\'t there yet, select "Request Institute" in the signup menu, and our campus expansion team will prioritize your location.'
        },
        {
            question: "How do I use a deal at a restaurant or shop?",
            answer: "1. Find your Deal in the app.\n2. Show your Parchi ID at the counter.\n3. The merchant verifies you instantly.\n4. Enjoy your student-exclusive pricing."
        },
        {
            question: "Is my data shared with brands?",
            answer: "Your privacy is our priority. We provide brands with aggregated insights (e.g., \"1,000 students used this offer\"), but we never sell your personal contact information or individual data to third parties."
        },
    ]

    return (
        <section className="w-full py-6 md:py-12 lg:py-16 bg-white">
            <div className="container px-4 md:px-6 mx-auto max-w-3xl">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-heading text-primary">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-muted-foreground md:text-lg">
                            Everything you need to know about Parchi.
                        </p>
                    </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left font-bold text-lg">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground whitespace-pre-line">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
