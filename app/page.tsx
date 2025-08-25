import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirecionar para o login - o middleware cuidará da autenticação
  redirect('/login')
}
