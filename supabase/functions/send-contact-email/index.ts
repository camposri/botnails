import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      throw new Error("Campos obrigatórios não preenchidos");
    }

    // Email to the business owner
    const businessEmail = "contato@botnails.com.br"; // Altere para o e-mail do negócio

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e57373 0%, #d4a574 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
            .value { background: white; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #e57373; }
            .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 3px solid #d4a574; white-space: pre-wrap; }
            .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💅 Novo Contato - BotNails</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nome</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">E-mail</div>
                <div class="value">${email}</div>
              </div>
              ${phone ? `
              <div class="field">
                <div class="label">WhatsApp</div>
                <div class="value">${phone}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Mensagem</div>
                <div class="message-box">${message}</div>
              </div>
            </div>
            <div class="footer">
              Mensagem enviada através do formulário de contato do site BotNails
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "BotNails <onboarding@resend.dev>", // Use seu domínio verificado
      to: [businessEmail],
      reply_to: email,
      subject: `Novo contato de ${name} - BotNails`,
      html: emailHtml,
    });

    console.log("Contact email sent successfully:", emailResponse);

    // Send confirmation email to the user
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e57373 0%, #d4a574 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; text-align: center; }
            .emoji { font-size: 48px; margin-bottom: 20px; }
            h2 { color: #e57373; }
            .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💅 BotNails</h1>
            </div>
            <div class="content">
              <div class="emoji">✨</div>
              <h2>Recebemos sua mensagem!</h2>
              <p>Olá ${name},</p>
              <p>Agradecemos o seu interesse! Recebemos sua mensagem e entraremos em contato em breve.</p>
              <p>Enquanto isso, fique à vontade para nos seguir nas redes sociais.</p>
            </div>
            <div class="footer">
              © BotNails - Gestão Profissional para Manicures
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: "BotNails <onboarding@resend.dev>", // Use seu domínio verificado
      to: [email],
      subject: "Recebemos sua mensagem! - BotNails",
      html: confirmationHtml,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);
