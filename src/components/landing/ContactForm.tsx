import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, MessageCircle, Mail, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  phone: z.string().trim().min(10, "Telefone inválido").max(20, "Telefone muito longo").optional().or(z.literal("")),
  message: z.string().trim().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(1000, "Mensagem muito longa"),
});

type ContactFormData = z.infer<typeof contactSchema>;
type ContactMethod = "email" | "whatsapp";

const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleWhatsApp = (validatedData: ContactFormData) => {
    const whatsappMessage = encodeURIComponent(
      `*Novo contato via site BotNails*\n\n` +
      `*Nome:* ${validatedData.name}\n` +
      `*E-mail:* ${validatedData.email}\n` +
      `${validatedData.phone ? `*Telefone:* ${validatedData.phone}\n` : ""}` +
      `\n*Mensagem:*\n${validatedData.message}`
    );

    const whatsappNumber = "5511999999999"; // Número de contato
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, "_blank");

    toast({
      title: "WhatsApp aberto!",
      description: "O WhatsApp foi aberto com sua mensagem. Envie para finalizar o contato.",
    });
  };

  const handleEmail = async (validatedData: ContactFormData) => {
    const { error } = await supabase.functions.invoke("send-contact-email", {
      body: validatedData,
    });

    if (error) {
      throw new Error("Erro ao enviar e-mail");
    }

    toast({
      title: "Mensagem enviada!",
      description: "Recebemos sua mensagem e entraremos em contato em breve.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedData = contactSchema.parse(formData);

      if (contactMethod === "whatsapp") {
        handleWhatsApp(validatedData);
      } else {
        await handleEmail(validatedData);
      }

      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Erro ao enviar",
          description: "Ocorreu um erro. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contato" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Ficou Interessado?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entre em contato e descubra como podemos ajudar a transformar seu negócio
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl mx-auto"
        >
          <div className="relative p-1 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary">
            <div className="bg-card rounded-[1.4rem] p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold">
                    Fale Conosco
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Responderemos o mais rápido possível
                  </p>
                </div>
              </div>

              {/* Contact Method Toggle */}
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setContactMethod("email")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                    contactMethod === "email"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">E-mail</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod("whatsapp")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                    contactMethod === "whatsapp"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">WhatsApp</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Nome *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Conte-nos sobre seu negócio e como podemos ajudar..."
                    rows={4}
                    className={errors.message ? "border-destructive" : ""}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground py-6 text-lg shadow-xl shadow-primary/25"
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : contactMethod === "email" ? (
                    <>
                      Enviar por E-mail
                      <Mail className="ml-2 w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Enviar por WhatsApp
                      <Send className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {contactMethod === "email"
                    ? "Você receberá uma confirmação no seu e-mail"
                    : "O WhatsApp será aberto com sua mensagem"}
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
