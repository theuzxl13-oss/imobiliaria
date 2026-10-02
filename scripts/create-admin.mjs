/**
 * Cria (ou promove) um usuário administrador do painel.
 *
 * Uso:
 *   npm run admin:create -- email@exemplo.com "SenhaForte123" "Nome do Administrador"
 *
 * Requer no .env.local: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 * Se o e-mail já existir no Supabase Auth, o usuário apenas recebe acesso de administrador
 * (a senha informada é ignorada nesse caso).
 */
import { createClient } from "@supabase/supabase-js";

const [email, password, name = "Administrador"] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

if (!email || !password) {
  console.error('Uso: npm run admin:create -- email@exemplo.com "SenhaForte123" "Nome"');
  process.exit(1);
}
if (!url || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env.local");
  process.exit(1);
}
if (password.length < 8) {
  console.error("A senha deve ter pelo menos 8 caracteres.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUserByEmail(target) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const user = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (user) return user;
    if (data.users.length < 200) return null;
  }
  return null;
}

let user = await findUserByEmail(email);
if (user) {
  console.log(`Usuário ${email} já existe — concedendo acesso de administrador.`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error) {
    console.error("Erro ao criar usuário:", error.message);
    process.exit(1);
  }
  user = data.user;
  console.log(`Usuário ${email} criado.`);
}

const { error } = await supabase
  .from("admins")
  .upsert({ user_id: user.id, email, name }, { onConflict: "user_id" });
if (error) {
  console.error("Erro ao registrar administrador:", error.message);
  process.exit(1);
}

console.log("✔ Administrador pronto! Acesse /admin/login com este e-mail.");
