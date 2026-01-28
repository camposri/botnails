import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o período de teste grátis?",
    answer: "Você tem 30 dias para testar todas as funcionalidades do BotNails sem pagar nada. Não pedimos cartão de crédito para começar. Após o período de teste, você pode optar por assinar o plano ou simplesmente parar de usar.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas de cancelamento. Basta acessar as configurações da sua conta e solicitar o cancelamento.",
  },
  {
    question: "Como funciona a confirmação automática pelo WhatsApp?",
    answer: "O BotNails envia mensagens automáticas para suas clientes 24h antes do agendamento, pedindo confirmação. Se a cliente confirmar, você recebe a notificação. Se não responder ou cancelar, o horário é liberado automaticamente.",
  },
  {
    question: "Minhas clientes conseguem agendar sozinhas?",
    answer: "Sim! Você recebe um link personalizado de agendamento que pode compartilhar nas redes sociais ou enviar diretamente para as clientes. Elas escolhem o serviço, data e horário disponíveis.",
  },
  {
    question: "O sistema funciona no celular?",
    answer: "Com certeza! O BotNails é 100% responsivo e funciona perfeitamente em qualquer dispositivo - celular, tablet ou computador. Você pode gerenciar sua agenda de qualquer lugar.",
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Sim, utilizamos criptografia de ponta a ponta e backups automáticos diários. Seus dados e os dados das suas clientes estão protegidos com a mesma tecnologia usada por bancos.",
  },
  {
    question: "Preciso ter conhecimento técnico para usar?",
    answer: "Não! O BotNails foi desenvolvido pensando na simplicidade. Em poucos minutos você configura sua conta e já pode começar a usar. E nosso suporte está sempre disponível para ajudar.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Dúvidas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Principais respostas para começar agora
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-2xl px-6 shadow-sm data-[state=open]:shadow-lg transition-shadow duration-300"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-lg hover:text-primary transition-colors py-6 [&[data-state=open]>svg]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
