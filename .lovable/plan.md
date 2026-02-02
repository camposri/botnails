
# Plano: Contador de Trial e Validacao de Email

## Resumo

Implementar duas funcionalidades importantes para o fluxo de registro e retencao de usuarios:

1. **Contador de Trial de 30 dias** - Acompanha o tempo desde o cadastro e exibe um lembrete para assinar o plano premium apos o periodo expirar
2. **Validacao de Email Obrigatoria** - Usuarios precisam confirmar o email antes de acessar o sistema

---

## Funcionalidades a Implementar

### 1. Contador de Trial de 30 Dias

O sistema vai:
- Registrar a data de criacao da conta (ja existe no campo `created_at` da tabela `profiles`)
- Adicionar campos `trial_ends_at` e `is_premium` na tabela `profiles`
- Calcular automaticamente os dias restantes do trial
- Exibir um banner discreto no dashboard mostrando os dias restantes
- Quando o trial expirar, exibir um modal/alerta convidando para assinar o plano premium

### 2. Validacao de Email

O fluxo sera:
- Ao se cadastrar, o usuario recebe uma mensagem informando que precisa verificar o email
- Nova pagina de "Aguardando Confirmacao" com instrucoes
- O email de verificacao sera enviado automaticamente pelo sistema de autenticacao
- Apos confirmar, o usuario e redirecionado ao dashboard

---

## Etapas de Implementacao

### Etapa 1: Alterar Banco de Dados

Adicionar campos na tabela `profiles`:

```sql
ALTER TABLE profiles
ADD COLUMN trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
ADD COLUMN is_premium BOOLEAN DEFAULT false;
```

Atualizar o trigger `handle_new_user` para definir `trial_ends_at`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, trial_ends_at, is_premium)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    now() + interval '30 days',
    false
  );
  RETURN NEW;
END;
$function$;
```

### Etapa 2: Criar Componente de Banner de Trial

Novo componente `src/components/dashboard/TrialBanner.tsx`:

- Consulta o perfil do usuario para obter `trial_ends_at` e `is_premium`
- Calcula dias restantes usando `date-fns`
- Exibe diferentes estados:
  - **Trial ativo**: "Voce tem X dias restantes no periodo gratuito"
  - **Trial expirando**: "Seu trial expira em X dias! Assine agora"
  - **Trial expirado**: Modal/alerta com botao para assinar premium
  - **Ja e premium**: Nao exibe nada

### Etapa 3: Atualizar Fluxo de Cadastro

Modificar `src/pages/Auth.tsx`:

- Apos o signup bem-sucedido, nao redirecionar automaticamente ao dashboard
- Exibir uma tela de "Email enviado para confirmacao"
- Instruir o usuario a verificar sua caixa de entrada
- Adicionar botao para reenviar email de confirmacao

### Etapa 4: Criar Pagina de Confirmacao Pendente

Nova pagina `src/pages/EmailPending.tsx`:

- Exibe mensagem amigavel sobre a verificacao de email
- Mostra o email para o qual foi enviada a confirmacao
- Botao para reenviar email
- Link para voltar ao login

### Etapa 5: Proteger Dashboard

Atualizar `src/components/dashboard/DashboardLayout.tsx`:

- Verificar se o email do usuario foi confirmado (`user.email_confirmed_at`)
- Se nao confirmado, redirecionar para a pagina de confirmacao pendente

### Etapa 6: Adicionar Rotas

Atualizar `src/App.tsx`:

- Adicionar rota `/email-pending` para a nova pagina

### Etapa 7: Integrar Banner no Layout

Atualizar `src/components/dashboard/DashboardLayout.tsx`:

- Adicionar o componente `TrialBanner` no topo do layout do dashboard

---

## Estrutura de Arquivos

```text
Novos arquivos:
- src/components/dashboard/TrialBanner.tsx
- src/components/dashboard/PremiumModal.tsx
- src/pages/EmailPending.tsx

Arquivos modificados:
- src/pages/Auth.tsx
- src/pages/Settings.tsx (para exibir status do plano)
- src/components/dashboard/DashboardLayout.tsx
- src/App.tsx
- supabase/migrations/[novo].sql
```

---

## Detalhes Tecnicos

### Hook para Trial Status

Criar um hook `useTrialStatus` que retorna:

```typescript
interface TrialStatus {
  isLoading: boolean;
  isPremium: boolean;
  daysRemaining: number;
  isExpired: boolean;
  trialEndsAt: Date | null;
}
```

### Calculo de Dias Restantes

```typescript
import { differenceInDays } from 'date-fns';

const daysRemaining = differenceInDays(
  new Date(trialEndsAt), 
  new Date()
);
```

### Verificacao de Email Confirmado

```typescript
const isEmailConfirmed = user?.email_confirmed_at !== null;
```

### Estados do Banner

| Estado | Dias Restantes | Visual |
|--------|----------------|--------|
| Ativo | > 7 | Badge discreto verde |
| Alerta | 1-7 | Banner amarelo |
| Urgente | 0-1 | Banner vermelho |
| Expirado | < 0 | Modal bloqueante |

---

## Fluxo do Usuario

```text
1. Usuario acessa /auth
2. Preenche formulario de cadastro
3. Sistema cria conta + envia email de verificacao
4. Usuario e redirecionado para /email-pending
5. Usuario clica no link do email
6. Sistema confirma email e redireciona para /dashboard
7. Dashboard exibe banner com dias restantes do trial
8. Apos 30 dias, modal aparece convidando para assinar
```

---

## Observacoes

- O sistema de email de verificacao ja e suportado nativamente pelo backend de autenticacao
- O trial de 30 dias comeca a contar a partir da confirmacao do email
- Usuarios premium nao veem o banner de trial
- O modal de upgrade nao bloqueia completamente o uso (apenas exibe periodicamente)
