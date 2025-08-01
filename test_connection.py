#!/usr/bin/env python3
"""
Script para testar a conexão com o servidor local
"""

import requests
import sys
from datetime import datetime

def test_server():
    try:
        print("🔍 Testando conexão com o servidor...")
        print("=" * 50)
        
        # Testa a conexão
        response = requests.get("http://localhost:8000", timeout=5)
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"✅ Status: {response.reason}")
        print(f"✅ Content-Type: {response.headers.get('content-type', 'N/A')}")
        print(f"✅ Content Length: {len(response.content)} bytes")
        print("=" * 50)
        
        # Verifica se contém o texto esperado
        content = response.text
        if "Servidor Python Funcionando" in content:
            print("✅ Página carregada corretamente!")
        else:
            print("⚠️  Página carregada, mas conteúdo inesperado")
        
        print("=" * 50)
        print("🎉 Teste concluído com sucesso!")
        print(f"📅 Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Não foi possível conectar ao servidor")
        print("💡 Verifique se o servidor está rodando na porta 8000")
        return False
        
    except requests.exceptions.Timeout:
        print("❌ Erro: Timeout na conexão")
        return False
        
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

if __name__ == "__main__":
    success = test_server()
    sys.exit(0 if success else 1) 