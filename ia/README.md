# Saldoo IA

Assistente financeiro desacoplado do monorepo. Ele pode funcionar em modo local, com respostas deterministicas, ou em modo integrado consumindo a API do Saldoo por token JWT.

## Execucao

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r ia/requirements.txt
python ia/chatbot.py
```

## Integracao Com A API

```bash
SALDOO_API_URL=http://127.0.0.1:8000 \
SALDOO_API_TOKEN=seu_token_jwt \
python ia/chatbot.py
```

## IA Generativa Opcional

```bash
GEMINI_API_KEY=sua_chave \
GEMINI_MODEL=gemini-2.5-flash \
python ia/chatbot.py
```

Sem `GEMINI_API_KEY`, o assistente usa o motor local.
