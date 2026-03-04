import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ThankYou() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingSlug = useMemo(() => {
    const raw = String(searchParams.get("slug") || "").trim();
    return raw || null;
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-primary">Obrigado por usar o BotNails</CardTitle>
          <CardDescription className="text-base">
            Junto com você para uma agenda mais interativa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {bookingSlug && (
            <Button className="w-full" onClick={() => navigate(`/book/${bookingSlug}`)}>
              Fazer novo agendamento
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>Fechar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
