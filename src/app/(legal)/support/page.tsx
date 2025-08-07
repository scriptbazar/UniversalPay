
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LifeBuoy, Mail, Phone } from "lucide-react";

const faqItems = [
    {
        question: "How do I create a payment link?",
        answer: "Navigate to the 'Payment Links' section in your merchant dashboard. Fill in the details like title and amount, and click 'Create Link'. You can then share the generated link with your customers."
    },
    {
        question: "How do withdrawals work?",
        answer: "Go to the 'Withdrawals' page in your dashboard. You can request a withdrawal of your available balance to your linked bank account or crypto wallet. Our team processes requests within 24-48 hours."
    },
    {
        question: "Can I customize the checkout page?",
        answer: "Yes! Under 'Settings > Branding', you can upload your logo and set a brand color to match your business identity, providing a seamless experience for your customers."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use industry-standard encryption and security protocols to protect all your data. Your API keys and sensitive information are stored securely."
    }
]

export default function SupportPage() {
    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight">Support Center</h1>
                <p className="mt-2 text-lg text-muted-foreground">We're here to help you with any questions or issues.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Support</CardTitle>
                        <CardDescription>
                            Fill out the form below and our team will get back to you as soon as possible.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Your Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Your Email" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                 <Label htmlFor="subject">Subject</Label>
                                 <Input id="subject" placeholder="How can we help?" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Describe your issue or question in detail..." rows={5} />
                            </div>
                            <Button type="submit" className="w-full">Send Message</Button>
                        </form>
                    </CardContent>
                </Card>
                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="single" collapsible className="w-full">
                                {faqItems.map((item, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger>{item.question}</AccordionTrigger>
                                        <AccordionContent>
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Other Ways to Reach Us</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Mail className="w-6 h-6 text-muted-foreground" />
                                <div>
                                    <h4 className="font-semibold">Email</h4>
                                    <p className="text-sm text-muted-foreground">support@universalpay.com</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <Phone className="w-6 h-6 text-muted-foreground" />
                                <div>
                                    <h4 className="font-semibold">Phone</h4>
                                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

    