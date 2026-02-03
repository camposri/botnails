import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SignupNotificationRequest {
  user_name: string;
  user_email: string;
  signup_date: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_name, user_email, signup_date }: SignupNotificationRequest = await req.json();

    // Validate required fields
    if (!user_email) {
      throw new Error("Email do usuário é obrigatório");
    }

    // Email to the admin
    const adminEmail = "contato@botnails.com.br"; // Email do administrador

    const formattedDate = new Date(signup_date).toLocaleString('pt-BR', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo'
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
            .value { background: white; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #4CAF50; }
            .cta { text-align: center; margin-top: 20px; }
            .cta a { display: inline-block; background: linear-gradient(135deg, #e57373 0%, #d4a574 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Novo Cadastro no BotNails!</h1>
            </div>
            <div class="content">
              <p>Um novo usuário acabou de se cadastrar na plataforma e está aguardando aprovação:</p>
              
              <div class="field">
                <div class="label">Nome</div>
                <div class="value">${user_name || 'Não informado'}</div>
              </div>
              <div class="field">
                <div class="label">E-mail</div>
                <div class="value">${user_email}</div>
              </div>
              <div class="field">
                <div class="label">Data do Cadastro</div>
                <div class="value">${formattedDate}</div>
              </div>
              
              <div class="cta">
                <a href="https://botnails.com.br/admin">Acessar Painel Admin</a>
              </div>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Lembre-se: o usuário só terá acesso ao sistema após você ativar a conta no painel administrativo.
              </p>
            </div>
            <div class="footer">
              Notificação automática do sistema BotNails
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "BotNails <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `🆕 Novo cadastro: ${user_name || user_email} - BotNails`,
      html: emailHtml,
    });

    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-new-signup function:", error);
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
