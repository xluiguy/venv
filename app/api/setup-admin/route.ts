import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ success: false, error: 'Variáveis de ambiente do Supabase ausentes.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const email = 'xavierluiguy@gmail.com'
  const password = '1a2b3c4d'

  try {
    // Tenta criar o usuário
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'administrador' },
    })

    if (error) {
      // Se o usuário já existir, apenas atualiza o metadado
      if (error.message.includes('User already exists')) {
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ email });
        if (listError || users.length === 0) {
          return NextResponse.json({ success: false, error: 'Usuário já existe, mas não foi possível encontrá-lo para atualizar.' }, { status: 500 });
        }
        
        const userId = users[0].id;
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { role: 'administrador' },
        });

        if (updateError) {
          return NextResponse.json({ success: false, error: `Usuário já existe. Falha ao atualizar: ${updateError.message}` }, { status: 500 });
        }
        
        return NextResponse.json({ success: true, message: 'Usuário administrador já existia e foi atualizado.' })
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}

