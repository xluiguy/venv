#!/usr/bin/env python3
"""
Servidor Python simples para teste no localhost
"""

import http.server
import socketserver
import webbrowser
import os
from datetime import datetime

# Configurações do servidor
PORT = 8000
HOST = "localhost"

# HTML da página de teste
HTML_CONTENT = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste de Servidor Python</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 600px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 2.5em;
        }
        .status {
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 1.2em;
        }
        .info {
            background: #f0f0f0;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
        }
        .timestamp {
            color: #666;
            font-size: 0.9em;
            margin-top: 20px;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .feature {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2196F3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Servidor Python Funcionando!</h1>
        
        <div class="status">
            ✅ Servidor rodando com sucesso no localhost
        </div>
        
        <div class="info">
            <h3>📊 Informações do Servidor:</h3>
            <p><strong>Host:</strong> {host}</p>
            <p><strong>Porta:</strong> {port}</p>
            <p><strong>Python:</strong> {python_version}</p>
            <p><strong>Data/Hora:</strong> {timestamp}</p>
        </div>
        
        <div class="features">
            <div class="feature">
                <h4>🌐 HTTP Server</h4>
                <p>Servidor HTTP básico funcionando</p>
            </div>
            <div class="feature">
                <h4>📱 Responsivo</h4>
                <p>Interface adaptável para dispositivos</p>
            </div>
            <div class="feature">
                <h4>🎨 Moderno</h4>
                <p>Design com CSS moderno</p>
            </div>
        </div>
        
        <div class="timestamp">
            Página gerada em: {timestamp}
        </div>
    </div>
</body>
</html>
"""

class TestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            # Retorna a página HTML personalizada
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            
            # Substitui as variáveis no HTML
            content = HTML_CONTENT.format(
                host=HOST,
                port=PORT,
                python_version="Python 3.13.5",
                timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S")
            )
            
            self.wfile.write(content.encode('utf-8'))
        else:
            # Para outros caminhos, usa o comportamento padrão
            super().do_GET()

def main():
    try:
        # Cria o servidor
        with socketserver.TCPServer((HOST, PORT), TestHandler) as httpd:
            print(f"🚀 Servidor iniciado em http://{HOST}:{PORT}")
            print(f"📅 Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
            print("=" * 50)
            print("📋 Informações:")
            print(f"   • Host: {HOST}")
            print(f"   • Porta: {PORT}")
            print(f"   • Python: 3.13.5")
            print("=" * 50)
            print("🌐 Abrindo navegador automaticamente...")
            print("⏹️  Pressione Ctrl+C para parar o servidor")
            print("=" * 50)
            
            # Abre o navegador automaticamente
            webbrowser.open(f"http://{HOST}:{PORT}")
            
            # Mantém o servidor rodando
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Servidor parado pelo usuário")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Erro: A porta {PORT} já está em uso!")
            print("💡 Tente usar uma porta diferente ou pare o processo que está usando esta porta.")
        else:
            print(f"❌ Erro ao iniciar o servidor: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    main() 