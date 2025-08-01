#!/usr/bin/env python3
"""
Servidor Python simples para teste
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import webbrowser
from datetime import datetime

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Configuração da resposta
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        
        # HTML simples
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Teste de Servidor Python</title>
    <meta charset="utf-8">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; background: #f0f0f0; }}
        .container {{ background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        h1 {{ color: #333; }}
        .success {{ color: green; font-weight: bold; }}
        .info {{ background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Servidor Python Funcionando!</h1>
        <p class="success">✅ Teste de servidor local bem-sucedido</p>
        
        <div class="info">
            <h3>📊 Informações:</h3>
            <p><strong>Host:</strong> localhost</p>
            <p><strong>Porta:</strong> 8000</p>
            <p><strong>Data/Hora:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
            <p><strong>Status:</strong> Online</p>
        </div>
        
        <p>🎉 O servidor Python está funcionando corretamente no localhost!</p>
    </div>
</body>
</html>
        """
        
        # Envia o HTML
        self.wfile.write(html.encode('utf-8'))

def main():
    try:
        # Configurações
        host = 'localhost'
        port = 8000
        
        # Cria o servidor
        server = HTTPServer((host, port), SimpleHandler)
        
        print(f"🚀 Servidor iniciado em http://{host}:{port}")
        print(f"📅 Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        print("=" * 50)
        print("🌐 Abrindo navegador...")
        print("⏹️  Pressione Ctrl+C para parar")
        print("=" * 50)
        
        # Abre o navegador
        webbrowser.open(f"http://{host}:{port}")
        
        # Mantém o servidor rodando
        server.serve_forever()
        
    except KeyboardInterrupt:
        print("\n🛑 Servidor parado pelo usuário")
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    main() 