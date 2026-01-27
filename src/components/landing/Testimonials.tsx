import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ana Carolina",
    role: "Manicure há 8 anos",
    content: "Antes eu perdia muito tempo com agenda no papel e mensagens pelo WhatsApp. Com o BotNails, tudo ficou organizado e profissional. Minhas clientes adoram!",
    avatar: "AC",
    rating: 5,
  },
  {
    name: "Juliana Santos",
    role: "Nail Designer",
    content: "O sistema de confirmação automática é incrível! Reduzi as faltas em mais de 70%. O investimento se paga sozinho.",
    avatar: "JS",
    rating: 5,
  },
  {
    name: "Maria Fernanda",
    role: "Dona de Esmalteria",
    content: "Gerencio 3 profissionais com o BotNails. Os relatórios financeiros me ajudam a tomar decisões melhores para o negócio.",
    avatar: "MF",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(180deg, hsl(20 33% 98%) 0%, hsl(350 65% 55% / 0.05) 50%, hsl(20 33% 98%) 100%)"
        }}
      />
      
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            O que nossas clientes dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Junte-se a centenas de profissionais que já transformaram sua gestão
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
